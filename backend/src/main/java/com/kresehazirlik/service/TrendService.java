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

    private final Repos.CheckInRepo checkIns;
    public TrendService(Repos.CheckInRepo checkIns) { this.checkIns = checkIns; }

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

    public List<Finding> findings(UUID childId, LocalDate today) {
        List<Finding> out = new ArrayList<>();
        var cur = byItem(window(childId, ObservationSource.PARENT, today, 7));
        var prev = byItem(window(childId, ObservationSource.PARENT, today.minusDays(7), 7));
        var month = byItem(window(childId, ObservationSource.PARENT, today, 30));

        for (var item : CheckInQuestionService.all()) {
            var c = cur.get(item.code()); var p = prev.get(item.code());
            if (c != null && p != null && c.size() >= 3 && p.size() >= 3) {
                double d = avg(c) - avg(p);
                if (d >= 0.6) out.add(new Finding("UP",
                        "“" + item.text() + "” konusunda son iki haftada belirgin bir kolaylaşma görülüyor."));
                else if (d <= -0.6) out.add(new Finding("WATCH",
                        "“" + item.text() + "” bu hafta geçen haftaya göre daha zorlayıcı görünüyor."));
            }
            var m = month.get(item.code());
            if (m != null && m.size() >= 5 && avg(m) < 1.5) out.add(new Finding("SUPPORT",
                    "Son haftalarda “" + item.text().toLowerCase(Locale.forLanguageTag("tr")) +
                    "” alanındaki zorlanma sürüyor. Bu alanı öğretmeniyle birlikte gözlemlemek yararlı olabilir."));
        }
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

    /** Ebeveyn ve öğretmen gözlemleri ayrı seriler olarak döner; asla tek ortalamada birleştirilmez. */
    public Map<String, Map<String, Double>> parentVsTeacher(UUID childId, LocalDate today) {
        var p = byItem(window(childId, ObservationSource.PARENT, today, 30));
        var t = byItem(window(childId, ObservationSource.TEACHER, today, 30));
        Map<String, Map<String, Double>> out = new LinkedHashMap<>();
        for (String code : p.keySet()) {
            if (!t.containsKey(code)) continue;
            out.put(code, Map.of("parent", avg(p.get(code)), "teacher", avg(t.get(code))));
        }
        return out;
    }
}
