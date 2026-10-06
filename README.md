# Sockbound — Gia tinh tìm vớ (A Hogwarts Adventure)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-blue.svg)]()
[![Build Status](https://img.shields.io/badge/Tests-59%2F59%20Passing-brightgreen.svg)]()

> **Một chiếc vớ. Cả đội tự do.**  
> Party game co-op platformer 2–8 người chơi kết nối bằng sợi dây thừng ma thuật, lấy cảm hứng từ *Pico Park*, *Chained Together* kết hợp thế giới phù thủy Hogwarts.  
> **Chế độ chơi: VERY HARD** — Cực kỳ thử thách, đòi hỏi sự phối hợp nhịp nhàng và kỹ năng Pro-Gamer!

---

## 📝 Nhật ký thay đổi (Changelog)

### Hôm nay — Thứ Ba, 06/10/2026

**1. Map V2 “Đồng đội bắt buộc” (màn 01–08)** — thiết kế lại toàn bộ 8 map cho nhiều người cùng phối hợp, xem chi tiết ở mục [Map V2](#-map-v2--đồng-đội-bắt-buộc-màn-0108).
- Mỗi map 6 chương dày đặc, 5 cờ nghỉ, map ngắn hơn nhưng không có đoạn “chạy không”.
- Cơ chế mới: vực ném, phiến nhịp trống + cửa hẹn giờ, bục chồng vai / tháp người / ném lên / bắn lên, bập bênh máy bắn, cầu màu nhà, quạt bật/tắt, bùa rút dây, sương Giám Ngục đuổi, dây sờn, vớ Snitch bay.
- Độ khó tự co giãn theo số người (số phiến trống, độ cao tháp, số màu cầu, tốc độ sương).
- 8 map cũ được giữ nguyên ở màn 09–16 (“Cổ điển · …”, đủ HARD MODE).
- Giao diện: vẽ đủ vật cản mới theo đúng hitbox engine, phiến trống sáng theo nhịp, cửa khóa “🔒 N NHỊP” + đồng hồ đếm ngược, sương tối + rung màn hình, âm thanh khi dậm trống / mở cửa / bắn, huy hiệu ở màn kết quả.
- Điểm: quỹ cờ nghỉ 2200 chia theo số cờ, par time theo map, huy hiệu 🥁 Nhịp hoàn hảo / 🪢 Không ai treo dây (+250 mỗi cái).
- Test mới `tests/maps_v2.test.cjs`: bot chạy engine thật, chứng minh mọi chướng ngại **1 người không qua được, đúng combo đồng đội thì qua được**.

**2. Audit & sửa lỗi**
- Một người chết = cả đội hồi sinh tại điểm nghỉ; Standing Death hoạt động đúng (miễn khi đang đỡ bạn, kéo dây, cầm vớ ở cửa); sàn sập hồi lại khi hồi sinh.
- Chống xuyên tường khi bị dây/cú đẩy kéo mạnh; thưởng tốc độ theo par time.
- Bảo mật: sửa lỗi XSS tên người chơi trong sảnh, lọc dữ liệu phím gửi qua mạng.
- Online: người mới chỉ vào được khi đang ở sảnh, đổi chủ phòng không mất tiến độ, tự loại người mất kết nối sau 15s (cả LAN), chủ phòng tạm dừng không còn đóng băng cả phòng.
- Hình vẽ khớp hitbox: bục di động, bập bênh, cánh quạt 4 lưỡi; sàn sập và bệ đỡ giờ đã hiện ra.
- Tháp người 3 tầng vượt tường thành (3-player bastion wall) kèm kiểm chứng vật lý.
- Test: 36 → **51 test** (thêm `tests/audit.test.cjs`, `tests/maps_v2.test.cjs`).

**3. Cơ chế thu thập vớ dọc đường (Bonus Socks) tăng điểm**
- Rải các chiếc vớ ma thuật nhỏ tại các vị trí hiểm hóc đòi hỏi phối hợp co-op:
  - Trên các bục cao (cần chồng vai, ném hoặc bập bênh bắn lên).
  - Treo lơ lửng giữa các hố sâu/quạt gió (phải làm mỏ neo cho bạn đu dây xuống nhặt rồi kéo lên).
  - Lơ lửng trên cao dọc đường (nhảy đơn không tới, cần tháp 2 người đứng nhảy lên hoặc ném).
  - Cuối các cầu bục màu hoặc phiến đá bùa rút dây.
- **Quy tắc giữ & cất vớ:**
  - Khi chạm vớ, gia tinh sẽ mang theo vớ (`socksCarried`).
  - Vớ chỉ được **cất an toàn** (`socksBanked`) khi cả đội an toàn bước qua **Cờ nghỉ (Checkpoint)** tiếp theo hoặc bước qua **Cổng về đích**.
  - Nếu cả đội tử nạn (team wipe), các chiếc vớ chưa cất sẽ bị rơi mất và xuất hiện lại tại chỗ cũ.
- **Điểm thưởng:** `+100 điểm` cho mỗi chiếc vớ đã cất an toàn + `+300 điểm thưởng hoàn hảo` nếu thu thập đủ tất cả vớ trong map.
- HUD hiển thị số lượng vớ: `🧦 [đã cất]/[tổng] (+[đang giữ])`. Âm thanh ding vui tai khi nhặt và thông báo toast chúc mừng khi đủ bộ.
- Bổ sung test suite `tests/socks.test.cjs` nâng tổng số test lên **59/59 passing**.

**4. Cân chỉnh độ chùng dây & khoảng cách phiến trống co-op (Drums & Ledge Spacing Calibration)**
- **Khắc phục lỗi kẹt/giật dây tại bục cao (Chương 3/6 · Bục lò sưởi, Bàn giáo sư, Bậc chồng vai)**:
  - *Nguyên nhân trước đây:* Bục cao 95px–140px nhưng phiến trống dưới sàn bị đặt cách xa chân bục tới 110px. Khoảng cách đường chéo giữa 2 bạn lên tới ~199px (tiệm cận kịch trần 220px của dây), tạo lực đàn hồi kéo giật cực mạnh: bạn dưới đất không thể bước tới phiến trống, bạn trên bục liên tục bị giật ngã xuống sàn.
  - *Giải pháp:* Kéo phiến trống dưới sàn vào sát ngay chân bục (khoảng hở chân bục chỉ còn **25px** thay vì 110px). Khoảng cách đường chéo giữa 2 bạn giảm xuống chỉ còn **~123px** (ngắn hơn chiều dài nghỉ 140px của dây). Dây chùng tự nhiên, giúp cả 2 người thoải mái căn nhịp nhảy cùng lúc mà không bị kéo giật.
- **Khắc phục lỗi thiếu dây khi dàn hàng ngang 3–4 người (Chương 5/6 · Nhịp cả hội)**:
  - *Nguyên nhân trước đây:* Khoảng cách giữa các phiến trống cạnh nhau trên sàn phẳng là 180px. Với đội 3 người, tổng cự ly từ phiến 1 đến phiến 3 là 360px, vượt xa tầm với của 2 đoạn dây 140px. Bạn thứ 3 không thể bước chân tới phiến trống nếu 2 bạn đầu không rời phiến; khi nhảy khoảng cách vượt 220px giật cả đội ngã chụm vào nhau.
  - *Giải pháp:* Rút gọn khoảng cách giữa các phiến trống trên sàn từ 180px xuống **105px** (khoảng hở giữa 2 phiến chỉ còn **45px**). Khi cả đội 3 hoặc 4 người đứng dàn hàng ngang, mỗi đoạn dây vẫn còn chùng tận **35px**, cho phép mọi người thoải mái lấy đà nhảy và tiếp đất cùng lúc.
- Toàn bộ 59/59 bài test bot solvability và physics tiếp tục đạt chuẩn tuyệt đối.

### Hôm qua — Thứ Hai, 05/10/2026

- Ra mắt bản co-op platformer Hogwarts nhiều chương với vật lý dây treo kiểu *Chained Together*; cấu hình deploy tĩnh lên Vercel.
- Vực sâu: chỉ wipe khi **cả đội** cùng rơi, người đang treo có thể được kéo lên; nới rộng vực để tăng thử thách.
- Vật cản đẩy lùi không xuyên qua; chương dài 1800px; tháp cao hơn, camera bám theo cả đội.
- Multiplayer online toàn cầu qua **Supabase Realtime** + Vercel.
- Chống đi xuyên qua nhau, cho đứng lên đầu nhau và nhảy cùng nhau; chặn xuyên qua cánh quạt / khối đá.
- Cơ chế Pro-Gamer: leo tháp thẳng đứng, đu dây con lắc, mỏ neo, đồng hồ nguy hiểm vực sâu.
- Cập nhật README: cơ chế, 8 chương, luật tính điểm.

---

## ⚠️ Quy tắc vàng NO WALKING CHALLENGE

> **🚫 ĐỨNG YÊN = CHẾT!** (Quá 120 ticks ~ 2.0 giây không di chuyển sẽ tử nạn)  
> **✅ LUÔN LUÔN NHẢY & DI CHUYỂN!**  
> **⚓ DÙNG MỎ NEO & ĐU CON LẮC ĐỂ VƯỢT VỰC THẲM!**

---

## 🚫 Cơ chế thử thách Hardcore

### 1. Crumbling Platforms (Sàn sập ma thuật)
```
     [=====]  ← Đặt chân lên → Phiến đá bắt đầu rung bần bật
        ↓
    [======]  ← Rung lắc dữ dội...
        ↓
      [===]    ← Sập hoàn toàn sau 75 ticks (~1.25 giây)!
        ↓
       🕳️       ← Rơi tự do nếu không nhảy kịp thời!
```
- **Kích hoạt:** Chạm chân lên phiến đá → Đá bắt đầu rung lắc.
- **Thời gian tồn tại:** 75 ticks (~1.25 giây) trước khi sập biến mất.
- **Chiến thuật:** Bước lên → **NHẢY NGAY LẬP TỨC** sang phiến đá tiếp theo!

### 2. Standing Death (Đứng yên = Tử nạn)
- Đồng hồ đếm ngược: Đứng yên trên mặt đất quá **120 ticks (~2.0 giây)** → 💀 Tử nạn ngay lập tức.
- Cơ chế reset: Liên tục di chuyển, đổi hướng, nhảy, bị quạt gió thổi, bật đệm lò xo hoặc va chạm bí ngô.
- Miễn trừ: đang làm bệ đỡ (có bạn đứng trên vai), đang kéo dây (hauling), vừa hồi sinh (bất tử ~1.7s), hoặc đứng chờ ở cửa khi đã có vớ.
- **Một người chết = cả đội hồi sinh** tại điểm nghỉ gần nhất (đứng yên, sàn sập, hoặc cả đội rơi vực). Mỗi lần tính 1 lần ngã.

### 3. Narrow Platforms (Bậc đá siêu hẹp)
| Chế độ thường | Chế độ VERY HARD |
|:-------------:|:----------------:|
| 95px – 140px  | **40px – 75px**  |
- Không gian vừa khít 1–2 gia tinh, đòi hỏi căn bước nhảy cực kỳ chính xác.

### 4. Massive Gaps (Vực sâu hun hút 550px – 650px)
| Phân đoạn thử thách | Chiều rộng vực thẳm |
|:-------------------:|:-------------------:|
| Pumpkin Drop        | **600px**           |
| Abyss Crossing      | **580px**           |
| Spring Bounce       | **580px**           |
| Wind Geyser         | **580px**           |
| Ice Slide           | **600px**           |
| Bastion Mountain    | **580px – 650px**   |
- Tuyệt đối không thể bước bộ hay nhảy đơn lẻ qua vực; bắt buộc phải kết hợp đệm lò xo, quạt gió, chồng tháp hoặc đu dây con lắc.

---

## 🏔️ Tháp cao thẳng đứng (Vertical Bastion Ascent)

### Thử thách: Leo tháp đá Hogwarts cao 300px!

```
                    ★               ← Đỉnh tháp Bastion Peak (y=270)
                   / \
                  /   \             ← Bậc 6: 252px (y=318)
                 /  ☐  \
                /       \           ← Bậc 5: 210px (y=360)
               /  ☐   ☐  \
              /           \         ← Bậc 4: 168px (y=402)
             /  ☐       ☐  \
            /               \       ← Bậc 3: 126px (y=444)
           /  ☐   ☐   ☐   ☐  \
          /                   \     ← Bậc 2: 84px (y=486)
         /  ☐   ☐   ☐   ☐   ☐  \
        /                       \   ← Bậc 1: 42px (y=528)
       /_________________________\  ← Sàn lâu đài (y=570)

 Độ cao leo tháp: 300px | Bậc đá thẳng đứng | Gió bão: 1.2
```

### Yêu cầu phối hợp đồng đội:
| Số lượng gia tinh | Khả năng vượt ải |
|:-----------------:|:-----------------|
| **1 người**       | Không thể qua (quạt thổi văng và thiếu đà) |
| **2 người**       | Vượt bậc 4–5 nếu căn nhịp hoàn hảo |
| **3 người**       | Đạt bậc 6–7 |
| **4–8 người**     | Chồng tháp 3–4 tầng leo thẳng lên đỉnh tháp! |

---

## 🎮 Cơ chế Pro-Gamer mới nâng cấp

### 1. Mỏ neo ma thuật (Heavy Anchor — Phím `S` / `↓`)
- **Cách kích hoạt:** Gia tinh đứng trên bờ vững chãi giữ phím **Xuống (`S` / `↓`)**.
- **Hiệu ứng:** Ghì chặt chân vào sàn đá, ma sát tăng gấp **5 lần** (`p.vx *= 0.15`, `kickX *= 0.2`).
- **Tác dụng:** Trở thành điểm tựa kiên cố, không bị đồng đội rơi vực kéo tụt cả lũ xuống vực sâu.

### 2. Đu dây con lắc (Pendulum Slingshot)
- **Cách kích hoạt:** Khi đang lơ lửng dưới vực (`p.dangling`), bấm nhấp nhả phím **Trái / Phải (`A/D` hoặc `←/→`)**.
- **Hiệu ứng:** Dây thừng biến thành con lắc dao động với lực văng cực đại lên tới `±12`.
- **Tác dụng:** Lấy trớn đu qua lại để phóng vút lên gờ đá bên kia vực mà không cần đồng đội kéo.

### 3. Cấm nhảy giữa không trung (No Mid-Air Abyss Jump)
- Khi đang lơ lửng dưới vực (`p.dangling && p.y > 526`), gia tinh **không thể đạp không khí nhảy lên**.
- Bắt buộc phải nhờ đồng đội trên bờ kéo lên (`Hauling`) hoặc đu con lắc lấy đà bám bờ.

### 4. Áp lực sương lạnh Azkaban (Azkaban Chill — 3-Second Abyss Hazard)
- Khi rơi sâu xuống đáy vực (`p.y >= 620`), bộ đếm thời gian tử thần kích hoạt.
- Nếu sau **180 ticks (~3.0 giây)** mà không được kéo lên bờ hoặc đu bám an toàn, sương lạnh Azkaban sẽ đóng băng gia tinh, kích hoạt hồi sinh tại Checkpoint.

### 5. Xử lý va chạm chống xuyên tường & cánh quạt (Anti-Clipping Physics)
- **Cánh quạt 4 lưỡi (Rotor Blades):** Kiểm tra khoảng cách đoạn thẳng từ tâm tới 4 đầu mút cánh quạt (`pointToSegmentDistance`), chặn đứng hoàn toàn lỗi đi xuyên qua cánh quạt và đẩy người chơi văng ra theo vector pháp tuyến.
- **Xếp chồng vai (Player Stacking Collision):** Tự động phát hiện bề mặt vai người đứng dưới, khóa chân người đứng trên không cho rơi xuyên thấu nhau.

### 6. Vách tường cao cần 3 người chồng tháp (3-Player Human Tower Bastion Wall)

```
                     [P3]  ← Gia tinh 3 (Đỉnh tháp): Bật nhảy đạt y=386, đáp lên đỉnh tường!
                      ||
                     [P2]  ← Gia tinh 2 (Tầng giữa): Đứng trên vai P1 (y=482)
                      ||    
            [SÀN]    [P1]  ← Gia tinh 1 (Đế móng): Trụ vững trên sàn (y=526)
             570      ||   ===========================
            ============== |  🏰 VÁCH TƯỜNG CAO 140px  |  (Đỉnh tường y=430)
                           |  (3-PLAYER TOWER WALL)  |
```

- **Chiều cao thử thách:** Vách tường đá nguyên khối thẳng đứng cao **140px** (từ sàn lâu đài `y = 570` lên tới đỉnh tường `y = 430`).
- **Phân tích vật lý & toán học bắt buộc 3 người:**
  - **1 người đơn độc:** Lực nhảy tối đa đạt độ cao delta `70.2px` (chân chạm đỉnh tại `y = 499.8px`), thiếu tới **69.8px** → Đập mặt vào tường rơi xuống.
  - **2 người chồng 2 tầng:** Gia tinh 2 nhảy từ vai gia tinh 1 đạt độ cao `y = 455.8px`, thiếu **25.8px** → Không thể chạm tới mép tường.
  - **3 người chồng 3 tầng:** Gia tinh 3 đứng trên vai gia tinh 2 (đầu tại `y = 438px`), khi bật nhảy chân vươn lên tới `y = 411.8px` (cao hơn đỉnh tường `18.2px`), đáp ngọt ngào lên mặt tường thành!
- **Kỹ thuật kéo đồng đội qua tường (Anchor & Hauling):**
  - Gia tinh 3 đáp lên tường giữ phím **`S` / `↓`** (Mỏ neo Anchor) cố định vị trí.
  - Dây thừng căng kéo gia tinh 2 và gia tinh 1 lên mặt tường lần lượt, hoặc gia tinh 3 nhảy xuống bờ bên kia làm đối trọng ròng rọc kéo 2 bạn vượt tường!
- **Hệ thống thích ứng thông minh (2-Player Room Adaptation):**
  - Khi phòng chơi có 2 người, hệ thống tự động triệu hồi bệ đá phù thủy phụ trợ (`y = 505`) để 2 người vẫn có thể vượt qua mà không bị kẹt màn. Khi có từ 3 người chơi trở lên, bệ đá chìm xuống hoàn toàn, bắt buộc phải phối hợp chồng tháp 3 tầng!

---

## 🥁 Map V2 — Đồng đội bắt buộc (màn 01–08)

8 map hoàn toàn mới, mỗi map được chia thành **6 chương dày đặc** (kèm 5 cờ nghỉ). Mọi chướng ngại đều được bot kiểm chứng bằng engine thật ([tests/maps_v2.test.cjs](file:///Users/khang/HP%20park/hogwarts-park/tests/maps_v2.test.cjs)): **1 người chơi đơn độc không thể qua, nhưng đúng combo đồng đội chắc chắn sẽ vượt qua**.

### Bảng cơ chế Co-op V2:
| Cơ chế | Cách phối hợp vượt ải |
|:--|:--|
| **Vực ném** (`tossGap` 112px) | Nhảy đơn chỉ bay được ~94px → Bấm `X` / `/` ném bạn qua bờ bên kia, bạn qua rồi làm mỏ neo kéo cả đội |
| **Phiến nhịp trống** 🥁 | Cả đội phải *tiếp đất* lên mọi phiến trống đang sáng trong vòng **20 ticks (~0.33s)** → Cổng mở (một số cổng hẹn giờ 1.8s–2.5s). Số phiến tự co giãn: `clamp(số_người, 2, 4)` |
| **Bục cao chuyên dụng** | `CHỒNG VAI` (95px, tháp 2 người) · `THÁP NGƯỜI` (140px khi ≥3 người) · `NÉM LÊN` (115px) · `BẮN LÊN` (160px) |
| **Bập bênh máy bắn** ⚖️ | 1–2 bạn đứng đầu phải bập bênh làm đạn; bạn còn lại dậm mạnh đầu trái → bay vút cao 175px. Khi ≥3 người, cần 2 bạn dậm cùng lúc |
| **Cầu màu nhà** 🎨 | Bục màu Gryffindor (đỏ), Slytherin (xanh lá), Ravenclaw (xanh dương), Hufflepuff (vàng) — chỉ có gia tinh cùng màu mới đứng được! Nhảy cóc: ném bạn sang bục của họ |
| **Quạt gió bật/tắt** 💨 | Quạt xoay chu kỳ bật/tắt — phải căn nhịp lúc gió thổi để cả hội cùng lướt qua |
| **Bùa rút dây** 🪢 | Bùa rút ngắn dây chỉ còn 80px–120px — cả đội phải xếp hàng nhảy từng phiến đá cùng nhịp |
| **Sương Giám Ngục đuổi** 🌫️ | Bức tường sương tối lùa từ phía sau (tốc độ tăng dần theo sĩ số đội). Ai tụt lại bị sương nuốt chửng = cả đội ngã |
| **Dây sờn đứt** (`ropeFray`) | Treo lơ lửng dưới vực quá 2.5s không được kéo lên sẽ làm đứt dây ma thuật (Team Wipe) |
| **Vớ Snitch ma thuật** (Màn 8) | Chiếc vớ tự do hóa thành Golden Snitch bay lượn trên không — phải chồng tháp và ném bạn lên chộp! |

### Danh sách 8 Màn chơi V2:
| Màn | Tên bản đồ | Bối cảnh | 6 Chương thử thách & Điểm nhấn Boss |
|:---:|:-----------|:---------|:-------------------------------------|
| **01** | **Phòng sinh hoạt chung** | Tháp Gryffindor | Thảm thủng (vực ném) → Trống phòng ngủ → Bục lò sưởi (chồng vai) → Hai lần bay → Nhịp cả hội → **BOSS: Tháp & Vực** |
| **02** | **Đại Sảnh Đường** | Bàn tiệc 4 nhà | Trống khai tiệc → Bàn giáo sư (chồng vai) → Cửa sảnh đóng nhanh → Băng chuyền đĩa → Giám Ngục dự tiệc (sương đuổi) → **BOSS: Trống trần nhà** |
| **03** | **Lớp học Bùa chú** | Thư viện & Bàn học | Cầu màu nhập môn (nhảy cóc) → Bùa đồng bộ → Cầu Wingardium → Cầu rồi vực → Bục Flitwick → **BOSS: Cầu đũa phép quay** |
| **04** | **Nhà kính Thảo dược** | Vườn cây cô Sprout | Quạt hắt hơi → Luống cây nhà → Gió rồi trống → Cầu rêu dài → Sương mù nhà kính (sương đuổi) → **BOSS: Nấm bật tung (máy bắn)** |
| **05** | **Cầu thang Hogwarts** | Tháp cầu thang chuyển dịch | Bậc chồng vai → Chiếu nghỉ thủng → Tháp pháo đài (tháp 3 người) → Nhịp cầu thang → Bục chỉ ném tới → **BOSS: Hai pháo đài** |
| **06** | **Nhà bếp gia tinh** | Lò nướng & Thớt gỗ | Thớt bập bênh (máy bắn) → Bí ngô lăn → Lò nướng bật tưng (2 người dậm) → Bí ngô trên trống → Giám Ngục vào bếp → **BOSS: Dây chuyền bắn** |
| **07** | **Phòng Chứa Bí Mật** | Cống ngầm Slytherin | Mương rắn (rút dây) → Cửa rắn quay → Cống ngầm quay (rút dây + cánh quạt) → Bẫy đá đôi → Tượng Slytherin → **BOSS: Hàm Tử Xà** |
| **08** | **Sân lâu đài Hogwarts** | Sân trường đại chiến | Giám Ngục ở cổng → Cầu bốn nhà → Máy bắn sân trường → Tháp đồng hồ → Hành lang bão (sương + rút dây) → **BOSS: Vớ Snitch bay** |

> 💡 **Lưu ý:** Map V2 tắt *Standing Death* (thay thế bằng áp lực sương Giám Ngục và dây sờn), thời gian hồi sinh nhanh gọn (40 ticks). Toàn bộ 8 map cũ được bảo lưu trọn vẹn tại màn 09–16 với tên gọi `Cổ điển · …` (đầy đủ các cơ chế Hard Mode nguyên bản).

---

## 🏰 Danh sách 8 Màn cổ điển (màn 09–16)

| Màn | Tên bản đồ | Bối cảnh Hogwarts | Chướng ngại vật chính |
|:---:|:-----------|:------------------|:----------------------|
| **09** | **Cổ điển · Phòng sinh hoạt chung** | Tháp Gryffindor | Tháp gối đệm vươn cao, quạt gió thổi tai, vực sàn gỗ 580px |
| **10** | **Cổ điển · Đại Sảnh Đường** | Bàn tiệc 4 nhà | Sàn bơ trơn trượt, bàn tiệc bập bênh, bí ngô bowling lăn dồn dập |
| **11** | **Cổ điển · Lớp học Bùa chú** | Giá sách phù thủy | Tháp sách đỉnh cao y=270, đệm lò xo bật tung, cuộn giấy băng chuyền |
| **12** | **Cổ điển · Nhà kính Thảo dược** | Vườn cây ma thuật | Quạt thông gió giật mạnh, mương tưới cây rêu trơn, nấm nổ tung người |
| **13** | **Cổ điển · Cầu thang Hogwarts** | Cầu thang chuyển dịch | **Vách tường 3 tầng chồng vai (140px)**, bậc thang chuyển dịch, cầu thang bập bênh |
| **14** | **Cổ điển · Nhà bếp gia tinh** | Thiên đường ẩm thực | Bơ đổ không phanh, nồi bí ngô đuổi đầu bếp, băng chuyền rửa chén |
| **15** | **Cổ điển · Phòng Chứa Bí Mật** | Hầm ngầm Slytherin | **Vách tường tượng đá xếp tầng (140px)**, cánh quạt trần 4 lưỡi xoay tròn |
| **16** | **Cổ điển · Sân lâu đài Hogwarts** | Sân vườn lâu đài | **Tổng hợp bẫy:** Bão tuyết, bơ trượt, quạt trần, lò xo nảy qua hào sâu |

---

## ⚙️ Bảng thông số kỹ thuật (Game Engine Parameters)

### 1. Thông số Kỹ thuật Map V2 (V2 Co-op Config):
| Thông số | Giá trị | Ý nghĩa gameplay |
|:---------|:-------:|:-----------------|
| `tossGap` | `112px` | Độ rộng vực ném (nhảy đơn tối đa 94px, ném bay xa tới 125px) |
| `window` | `20 ticks (~0.33s)` | Khoảng thời gian cho phép giữa các lần tiếp đất trên phiến trống |
| `launchVy` | `-17` | Vận tốc bập bênh phóng người chơi lên cao ~175px |
| `ropeFray` | `150 ticks (~2.5s)` | Giới hạn chịu lực khi đồng đội bị treo dưới vực trước khi đứt dây |
| `fogSpeed` | `1.6 / 1.9 / 2.2` | Tốc độ di chuyển của sương Giám Ngục (theo số người ≤2 / ≤4 / ≤8) |
| `shrinkRest / shrinkMax` | `80px / 120px` | Độ dài tự nhiên và độ dài căng cực đại trong vùng bùa rút dây |
| `houseSpacing` | `160px` | Khoảng cách giữa 2 bục cùng màu nhà (phải có bạn ném mới tới) |
| `blockHeight (stack2)` | `95px` | Chiều cao bục chồng vai 2 tầng |
| `blockHeight (stack3)` | `140px` | Chiều cao bục tháp 3 tầng (tự hạ 95px khi phòng chỉ có 2 người) |
| `blockHeight (toss)` | `115px` | Chiều cao bục chỉ có thể ném bạn mới lên được |
| `blockHeight (cat)` | `160px` | Chiều cao bục bập bênh máy bắn |
| `drumSpacingFloor` | `105px` | Khoảng cách tâm giữa các phiến trống phẳng (chùng dây 35px cho đội 2–4 người) |
| `drumSpacingLedge` | `95px` | Cự ly chân bục cao tới phiến sàn (khoảng hở 25px → đường chéo ~123px < 140px dây) |
| `bonusSockPoints` | `+100 / +300` | +100đ mỗi chiếc vớ cất an toàn, +300đ thưởng đủ bộ |

### 2. Thông số Kỹ thuật Chế độ Cổ điển (Classic HARD Mode Config):
| Thông số | Giá trị | Ý nghĩa gameplay |
|:---------|:-------:|:-----------------|
| `gravity` | `0.85` | Trọng lực nặng, rơi nhanh và dứt khoát |
| `jumpPower` | `-12` | Lực nhảy chuẩn xác, nhảy đơn đạt 84px |
| `springPower` | `-16` | Đệm lò xo phóng cao 150px qua vực sâu |
| `maxFallSpeed` | `14` | Tốc độ rơi tối đa |
| `moveSpeed` | `1.3` | Tốc độ chạy gia tinh |
| `friction` | `0.52` | Độ bám ma sát mặt đất thường |
| `ropeLength` | `185px` | Chiều dài tự nhiên của dây thừng co giãn |
| `ropeMax` | `300px` | Giới hạn kéo căng dây thừng trước khi giật mạnh |
| `abyssGap` | `550 – 620px` | Chiều dài vực thẳm ma thuật |
| `standingDeathTicks` | `120 ticks` | Đứng yên quá 2 giây = Tử nạn |
| `maxPlatformTime` | `75 ticks` | Sàn sập sau 1.25 giây đặt chân |
| `respawnTimer` | `32 ticks` | Thời gian hồi sinh đồng đội tại Checkpoint (~0.53s) |
| `mountainPeakY` | `270px` | Đỉnh tháp thẳng đứng cao 300px |
| `mountainWindForce` | `1.2` | Sức gió cản trở trên đỉnh núi |
| `pumpkinBounce` | `-8` | Lực nảy vui nhộn khi va phải bí ngô |
| `rotorKnockback` | `-11.5` | Lực hất văng khi quẹt trúng cánh quạt xoay |

---

## 🏆 Hệ thống Chấm điểm & Đánh giá Sao (Scoring System)

```
Tổng điểm = Điểm Checkpoint + Điểm Chiếc Vớ + Điểm Về Đích + Thưởng Tốc Độ + Thưởng Cẩn Thận + Huy hiệu + Vớ Dọc Đường
```

- **Cờ Checkpoint:** tổng quỹ `2200 điểm` chia đều cho số cờ của map (cổ điển 11 cờ × 200, V2 5 cờ × 440).
- **Chiếc vớ tự do (The Sock):** `+500 điểm` khi chạm lấy vớ khóa cổng.
- **Về đích (Gate Clearance):** `+1000 điểm` khi cả đội cùng bước qua cổng vòm.
- **Thưởng Tốc độ (Speed Bonus):** `max(0, 1000 - max(0, giây - par) * 3)` — par V2 = 240s (map 8: 300s), cổ điển = `chiều_dài_map / 100` giây.
- **Thưởng Cẩn thận (Care Bonus):** `max(0, 600 - số_lần_chết * 50)` — Không ngã vực bảo toàn 600 điểm tuyệt đối.
- **Huy hiệu (V2):** 🥁 *Nhịp hoàn hảo* (ít cú dậm hụt) `+250` · 🪢 *Không ai treo dây* `+250`.
- **Vớ Dọc Đường (Bonus Socks):** `+100 điểm` mỗi chiếc đã cất an toàn tại cờ nghỉ / cổng đích + `+300 điểm thưởng đủ bộ` khi nhặt sạch toàn bộ vớ trong màn.
- **Đánh giá Xếp hạng Sao:**
  - 🌟🌟🌟 **3 Sao:** Tổng điểm ≥ **5,000 điểm** (Chuẩn Pro-Gamer Speedrun).
  - 🌟🌟 **2 Sao:** Tổng điểm ≥ **4,200 điểm** (Vượt ải xuất sắc).
  - 🌟 **1 Sao:** Hoàn thành màn chơi.

---

## 🎹 Bảng điều khiển (Hỗ trợ 2–8 người chơi trên 1 bàn phím)

| Gia tinh | Di chuyển | Nhảy | Mỏ neo (Anchor) | Ném bạn (Toss) |
|:--------:|:---------:|:----:|:---------------:|:--------------:|
| **P1** | `A` / `D` | `W` / `Space` | **`S`** | `X` |
| **P2** | `←` / `→` | `↑` | **`↓`** | `/` |
| **P3** | `J` / `L` | `I` | **`K`** | `O` |
| **P4** | `F` / `H` | `T` | **`G`** | `Y` |
| **P5** | `Z` / `C` | `Q` | **`S`** | `V` |
| **P6** | `B` / `M` | `N` | **`H`** | `,` |
| **P7** | `1` / `3` | `5` | **`2`** | `4` |
| **P8** | `7` / `9` | `+` | **`8`** | `0` |

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Chạy Local (Zero Dependencies):
```sh
# Di chuyển vào thư mục dự án
cd hogwarts-park

# Khởi chạy server Node.js
npm start

# Mở trình duyệt trải nghiệm tại
http://localhost:3017
```

### Chạy Kiểm thử (Test Suite):
```sh
# Kiểm tra cú pháp syntax
npm run check

# Chạy toàn bộ 59 test (cổ điển + audit + bot giải map V2 + thu thập vớ)
npm test

# Build bundle client
npm run build
```

---

## 🌐 Triển khai & Trải nghiệm Trực tuyến

- **Production Vercel:** [https://hogwarts-park.vercel.app](https://hogwarts-park.vercel.app)
- **GitHub Repository:** [qkn202/hogwarts-park](https://github.com/qkn202/hogwarts-park)

---

## 📜 Giấy phép
Phát hành theo giấy phép **MIT License**. Dự án mã nguồn mở phục vụ cộng đồng yêu thích Harry Potter và dòng game Party Co-op!
