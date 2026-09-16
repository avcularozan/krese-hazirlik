package com.kresehazirlik.service;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.repo.Repos;
import org.springframework.stereotype.Service;
import java.time.LocalDate; import java.util.*;
import java.util.stream.Collectors;

/**
 * Trend motoru.
 * Kurallar: tek günden sonuç çıkarılmaz; bir cümle üretmek için en az 3 kayıt,
 * "desteklenebilecek alan" demek için en az 5 kayıt ve 14 günlük bir yayılım gerekir.
 * Hiçbir yerde başka çocuklarla karşılaştırma veya persentil hesaplanmaz.
 */
@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class TrendService {

    public record Finding(String kind, String text) {}   // kind: UP | WATCH | SUPPORT | DOWN
    public record AreaScore(String areaCode, double average, int observationCount) {}
    public record Buckets(List<AreaScore> strong, List<AreaScore> emerging, List<AreaScore> supportable) {}

    private static final int MAX_UP = 3, MAX_WATCH = 2, MAX_SUPPORT_AREAS = 2;

    private final Repos.CheckInRepo checkIns;
    private final Repos.AreaRepo areas;
    public TrendService(Repos.CheckInRepo checkIns, Repos.AreaRepo areas) {
        this.checkIns = checkIns; this.areas = areas;
    }

    private String areaName(String code) {
        return areas.findByCode(code).map(DevelopmentArea::getNameTr).orElse(code);
    }

    private List<DailyCheckIn> window(UUID childId, ObservationSource src, LocalDate end, int days) {
        return checkIns.findByChildIdAndSourceAndCheckInDateBetweenOrderByCheckInDateAsc(
                childId, src, end.minusDays(days - 1L), end);
    }

    private Map<String, List<Short>> byItem(List<DailyCheckIn> list) {
        Map<String, List<Short>> m = new HashMap<>();
        for (DailyCheckIn ci : list)
            for (Observation o : ci.getObservations())
                if (o.getValue() != null) m.computeIfAbsent(o.getItemCode(), k -> new ArrayList<>()).add(o.getValue());
        return m;
    }
    private static double avg(List<Short> v) { return v.stream().mapToInt(Short::intValue).average().orElse(0); }

    /**
     * Aynı cümle tekrarlanmaz: ilerleme en fazla 3, izleme en fazla 2 madde ile;
     * "desteklenebilecek" bulguları madde madde değil alan bazında toplanır ve en fazla 2 alan gösterilir.
     */
    public List<Finding> findings(UUID childId, LocalDate today) {
        var cur = byItem(window(childId, ObservationSource.PARENT, today, 7));
        var prev = byItem(window(childId, ObservationSource.PARENT, today.minusDays(7), 7));
        var month = byItem(window(childId, ObservationSource.PARENT, today, 30));

        record Delta(CheckInQuestionService.Item item, double change) {}
        List<Delta> ups = new ArrayList<>(), watches = new ArrayList<>();
        Map<String, List<CheckInQuestionService.Item>> weakByArea = new LinkedHashMap<>();
        Map<String, Double> areaAverage = new HashMap<>();

        for (var item : CheckInQuestionService.all()) {
            var c = cur.get(item.code()); var p = prev.get(item.code());
            if (c != null && p != null && c.size() >= 3 && p.size() >= 3) {
                double d = avg(c) - avg(p);
                if (d >= 0.6) ups.add(new Delta(item, d));
                else if (d <= -0.6) watches.add(new Delta(item, d));
            }
            var m = month.get(item.code());
            if (m != null && m.size() >= 5 && avg(m) < 1.5) {
                weakByArea.computeIfAbsent(item.areaCode(), k -> new ArrayList<>()).add(item);
                areaAverage.merge(item.areaCode(), avg(m), Math::min);
            }
        }

        List<Finding> out = new ArrayList<>();
        ups.sort(Comparator.comparingDouble(Delta::change).reversed());
        ups.stream().limit(MAX_UP).forEach(d -> out.add(new Finding("UP",
                "“" + d.item().text() + "” konusunda son iki haftada belirgin bir kolaylaşma görülüyor.")));

        watches.sort(Comparator.comparingDouble(Delta::change));
        watches.stream().limit(MAX_WATCH).forEach(d -> out.add(new Finding("WATCH",
                "“" + d.item().text() + "” bu hafta geçen haftaya göre daha zorlayıcı görünüyor.")));

        // En çok zorlanılan alanlar önce; her alan için tek cümle, örnek maddelerle.
        weakByArea.entrySet().stream()
                .sorted(Comparator.comparingDouble(e -> areaAverage.getOrDefault(e.getKey(), 3.0)))
                .limit(MAX_SUPPORT_AREAS)
                .forEach(e -> {
                    String examples = e.getValue().stream().limit(2)
                            .map(i -> i.text().toLowerCase(Locale.forLanguageTag("tr")))
                            .collect(Collectors.joining(", "));
                    out.add(new Finding("SUPPORT",
                            "“" + areaName(e.getKey()) + "” alanında son haftalarda zorlanma sürüyor " +
                            "(örneğin " + examples + "). Bu alanı öğretmeniyle birlikte gözlemlemek yararlı olabilir."));
                });
        return out;
    }

    public Buckets buckets(UUID childId, LocalDate today) {
        var list = window(childId, ObservationSource.PARENT, today, 30);
        Map<String, List<Short>> byArea = new HashMap<>();
        for (DailyCheckIn ci : list)
            for (Observation o : ci.getObservations())
                if (o.getValue() != null) byArea.computeIfAbsent(o.getAreaCode(), k -> new ArrayList<>()).add(o.getValue());

        List<AreaScore> strong = new ArrayList<>(), emerging = new ArrayList<>(), supportable = new ArrayList<>();
        byArea.forEach((area, vals) -> {
            if (vals.size() < 3) return;                              // yetersiz veriyle sınıflandırma yapılmaz
            double a = avg(vals);
            AreaScore s = new AreaScore(area, a, vals.size());
            (a >= 2.4 ? strong : a >= 1.5 ? emerging : supportable).add(s);
        });
        return new Buckets(strong, emerging, supportable);
    }

    /**
     * Uzun süren ve birden fazla alanı etkileyen örüntüde ölçülü yönlendirme.
     * Tanı değildir, kesinlik iddia etmez.
     */
    public Optional<String> referralHint(UUID childId, LocalDate today) {
        var month = window(childId, ObservationSource.PARENT, today, 30);
        Map<String, List<Short>> byItem = byItem(month);
        Set<String> weakAreas = CheckInQuestionService.all().stream()
                .filter(i -> { var v = byItem.get(i.code()); return v != null && v.size() >= 5 && avg(v) < 1.2; })
                .map(CheckInQuestionService.Item::areaCode).collect(Collectors.toSet());
        if (weakAreas.size() < 3) return Optional.empty();
        return Optional.of("Birden fazla alanda üç haftadır süren bir zorlanma görünüyor. Bu durumun bir süre daha " +
                "devam etmesi halinde öğretmeninizle ve uygun bir çocuk gelişimi uzmanıyla görüşmeniz yararlı olabilir.");
    }

    public record ComparisonItem(String itemCode, String itemText, String areaCode,
                                 double parentAverage, int parentCount,
                                 double teacherAverage, int teacherCount) {}

    /** Ebeveyn ve öğretmen gözlemleri ayrı seriler olarak döner; asla tek ortalamada birleştirilmez. */
    public List<ComparisonItem> parentVsTeacher(UUID childId, LocalDate today) {
        var p = byItem(window(childId, ObservationSource.PARENT, today, 30));
        var t = byItem(window(childId, ObservationSource.TEACHER, today, 30));
        List<ComparisonItem> out = new ArrayList<>();
        // Katalog sırası korunur; yalnızca iki tarafın da kaydı olan maddeler yan yana konur.
        for (var item : CheckInQuestionService.all()) {
            var pv = p.get(item.code());
            var tv = t.get(item.code());
            if (pv == null || tv == null) continue;
            out.add(new ComparisonItem(item.code(), item.text(), item.areaCode(),
                    avg(pv), pv.size(), avg(tv), tv.size()));
        }
        return out;
    }

    /** Öğretmen serisinin özeti: kaç gün gözlem girilmiş ve en son ne zaman. */
    public Optional<LocalDate> lastTeacherObservation(UUID childId, LocalDate today) {
        var list = window(childId, ObservationSource.TEACHER, today, 30);
        return list.isEmpty() ? Optional.empty()
                : Optional.of(list.get(list.size() - 1).getCheckInDate());
    }

    public int teacherEntryCount(UUID childId, LocalDate today) {
        return window(childId, ObservationSource.TEACHER, today, 30).size();
    }
}
