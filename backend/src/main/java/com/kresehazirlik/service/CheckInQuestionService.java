package com.kresehazirlik.service;

import com.kresehazirlik.domain.*;
import com.kresehazirlik.repo.Repos;
import org.springframework.stereotype.Service;
import java.time.*; import java.time.temporal.ChronoUnit; import java.util.*;
import java.util.stream.Collectors;

/**
 * Günlük check-in için dinamik soru seçimi.
 * Her gün aynı uzun form gösterilmez: en fazla 5 madde, evreye ve son cevaplara göre seçilir.
 */
@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class CheckInQuestionService {

    public record Item(String code, String text, String areaCode, int phase, List<String> optionLabels) {}

    public static final List<String> DEFAULT_SCALE =
            List.of("Çok zorlandı", "Zorlandı", "Biraz zorlandı", "Kolay geçti");

    private static final List<Item> ITEMS = List.of(
        new Item("evden", "Evden çıkma", "duygu", 1, DEFAULT_SCALE),
        new Item("ayrilik", "Ayrılık anındaki tepki", "duygu", 1, DEFAULT_SCALE),
        new Item("sakin", "Ayrılıktan sonra sakinleşmesi", "duygu", 1, List.of("Uzun sürdü", "15-30 dakika", "5-10 dakika", "Hemen sakinleşti")),
        new Item("destek", "Öğretmenden destek kabul etmesi", "sosyal", 1, List.of("Kabul etmedi", "Zor kabul etti", "Bir süre sonra kabul etti", "Rahatça kabul etti")),
        new Item("oyun", "Oyuna katılım", "oyun", 1, DEFAULT_SCALE),
        new Item("yemek", "Yemek", "ozbakim", 1, DEFAULT_SCALE),
        new Item("uyku", "Uyku / dinlenme", "ozbakim", 1, DEFAULT_SCALE),
        new Item("donus", "Eve dönüşteki duygu durumu", "duygu", 1, List.of("Çok yorgun/üzgündü", "Durgundu", "İyiydi", "Neşeliydi")),
        new Item("ogrt", "Öğretmenle ilişkisi", "sosyal", 2, DEFAULT_SCALE),
        new Item("rutin", "Sınıf rutinlerine katılım", "dikkat", 2, DEFAULT_SCALE),
        new Item("yonerge", "Yönerge takibi", "dikkat", 2, DEFAULT_SCALE),
        new Item("etkinlik", "Etkinliklere katılım", "bilis", 2, DEFAULT_SCALE),
        new Item("akranilgi", "Akranlarına ilgisi", "sosyal", 2, DEFAULT_SCALE),
        new Item("sabah", "Sabah hazırlığı (kalkma, giyinme)", "ozbakim", 2, DEFAULT_SCALE),
        new Item("aidiyet", "Okula aidiyet duygusu", "sosyal", 3, DEFAULT_SCALE),
        new Item("guven", "Öğretmene güven", "sosyal", 3, DEFAULT_SCALE),
        new Item("giris", "Sınıfa isteyerek girmesi", "sosyal", 3, DEFAULT_SCALE),
        new Item("secme", "Kendi etkinliğini seçmesi", "oyun", 3, DEFAULT_SCALE),
        new Item("akran", "Akran etkileşimi", "sosyal", 3, DEFAULT_SCALE),
        new Item("duyguduz", "Gün içinde duygularını düzenlemesi", "duygu", 3, DEFAULT_SCALE),
        new Item("konusma", "Sınıfta konuşması / istek belirtmesi", "dil", 3, DEFAULT_SCALE),
        new Item("ozbakim", "Öz bakım (el yıkama, giyinme)", "ozbakim", 4, DEFAULT_SCALE),
        new Item("tuvalet", "Tuvalet ihtiyacını haber vermesi", "ozbakim", 4, DEFAULT_SCALE),
        new Item("bagimsiz", "Bağımsız hareket etmesi", "ozbakim", 4, DEFAULT_SCALE),
        new Item("esya", "Eşyalarını tanıması ve toplaması", "bilis", 4, DEFAULT_SCALE),
        new Item("sira", "Sıra bekleme", "sosyal", 4, DEFAULT_SCALE),
        new Item("paylasma", "Oyuncak paylaşması", "sosyal", 4, DEFAULT_SCALE),
        new Item("gecis", "Geçişlere uyum (etkinlikten etkinliğe)", "dikkat", 4, DEFAULT_SCALE),
        new Item("hayal", "Küçük hayal kırıklıklarını tolere etmesi", "duygu", 4, DEFAULT_SCALE),
        new Item("anlatim", "Okulda olanları anlatması", "dil", 4, DEFAULT_SCALE),
        new Item("enerji", "Eve döndüğünde enerjisi", "kaba", 4, List.of("Tükenmiş görünüyordu", "Çok yorgundu", "Biraz yorgundu", "Dinç görünüyordu"))
    );

    public static Optional<Item> byCode(String code) {
        return ITEMS.stream().filter(i -> i.code().equals(code)).findFirst();
    }
    public static List<Item> all() { return ITEMS; }

    public static int schoolDay(LocalDate startDate, LocalDate on) {
        return (int) ChronoUnit.DAYS.between(startDate, on) + 1;
    }
    public static int phaseOf(int day) { return day <= 3 ? 1 : day <= 7 ? 2 : day <= 14 ? 3 : 4; }

    private final Repos.CheckInRepo checkIns;
    public CheckInQuestionService(Repos.CheckInRepo checkIns) { this.checkIns = checkIns; }

    public List<Item> pick(UUID childId, LocalDate startDate, LocalDate today, Set<String> focusAreas) {
        int day = Math.max(1, schoolDay(startDate, today));
        int phase = phaseOf(day);
        var recent = checkIns.findByChildIdAndSourceAndCheckInDateBetweenOrderByCheckInDateAsc(
                childId, ObservationSource.PARENT, today.minusDays(7), today);
        Map<String, List<Short>> lastWeek = new HashMap<>();
        Map<String, Integer> askedLast3 = new HashMap<>();
        Map<String, Short> yesterday = new HashMap<>();
        for (DailyCheckIn ci : recent) {
            boolean within3 = !ci.getCheckInDate().isBefore(today.minusDays(3));
            for (Observation o : ci.getObservations()) {
                if (o.getValue() != null) lastWeek.computeIfAbsent(o.getItemCode(), k -> new ArrayList<>()).add(o.getValue());
                if (within3) askedLast3.merge(o.getItemCode(), 1, Integer::sum);
                if (ci.getCheckInDate().equals(today.minusDays(1)) && o.getValue() != null)
                    yesterday.put(o.getItemCode(), o.getValue());
            }
        }
        int max = day <= 3 ? 5 : 4;
        return ITEMS.stream()
                .filter(i -> i.phase() <= phase)
                .sorted(Comparator.comparingDouble((Item i) -> -score(i, phase, focusAreas, lastWeek, askedLast3, yesterday)))
                .limit(max)
                .collect(Collectors.toList());
    }

    private double score(Item i, int phase, Set<String> focus,
                         Map<String, List<Short>> lastWeek, Map<String, Integer> askedLast3, Map<String, Short> yesterday) {
        double s = 0;
        s -= 2.0 * askedLast3.getOrDefault(i.code(), 0);              // son 3 gün sorulmuşsa geri çek
        Short y = yesterday.get(i.code());
        if (y != null && y <= 1) s += 6;                              // dün zorlandıysa öncelikli sor
        if (i.phase() == phase && phase > 1) s += 5;                  // yeni açılan evre maddeleri
        if (focus.contains(i.areaCode())) s += 2;                     // ebeveynin takip etmek istediği alan
        if (phase == 1) s += 3;
        List<Short> w = lastWeek.get(i.code());
        if (w != null && w.size() >= 3 && w.stream().mapToInt(Short::intValue).average().orElse(0) >= 2.6) s -= 5;
        return s;
    }
}
