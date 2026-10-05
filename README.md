# Sockbound — Gia tinh tìm vớ (A Hogwarts Adventure)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-blue.svg)]()
[![Build Status](https://img.shields.io/badge/Tests-24%2F24%20Passing-brightgreen.svg)]()

> **Một chiếc vớ. Cả đội tự do.**  
> Party game co-op platformer 2–8 người chơi kết nối bằng sợi dây thừng ma thuật, lấy cảm hứng từ *Pico Park*, *Chained Together* kết hợp thế giới phù thủy Hogwarts.  
> **Chế độ chơi: VERY HARD** — Cực kỳ thử thách, đòi hỏi sự phối hợp nhịp nhàng và kỹ năng Pro-Gamer!

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

## 🏰 Danh sách 8 Màn chơi (8 Hogwarts Chapters)

| Màn | Tên bản đồ | Bối cảnh Hogwarts | Chướng ngại vật chính |
|:---:|:-----------|:------------------|:----------------------|
| **1** | **Phòng sinh hoạt chung** *(Common Room)* | Tháp Gryffindor ấm áp với lò sưởi | Tháp gối đệm vươn cao, quạt gió thổi tai, vực sàn gỗ 580px |
| **2** | **Đại Sảnh Đường** *(Great Hall)* | Bàn tiệc 4 nhà dài bất tận | Sàn bơ trơn trượt, bàn tiệc bập bênh, bí ngô bowling lăn dồn dập |
| **3** | **Lớp học Bùa chú** *(Charms)* | Giá sách phù thủy cao chót vót | Tháp sách đỉnh cao y=270, đệm lò xo bật tung, cuộn giấy băng chuyền |
| **4** | **Nhà kính Thảo dược** *(Greenhouse)* | Vườn cây ma thuật của cô Sprout | Quạt thông gió giật mạnh, mương tưới cây rêu trơn, nấm nổ tung người |
| **5** | **Cầu thang Hogwarts** *(Grand Staircase)* | Cầu thang dịch chuyển kỳ bí | **Vách tường 3 tầng chồng vai (140px)**, bậc thang chuyển dịch, cầu thang bập bênh |
| **6** | **Nhà bếp gia tinh** *(Hogwarts Kitchen)* | Thiên đường ẩm thực của Dobby | Bơ đổ không phanh, nồi bí ngô đuổi đầu bếp, băng chuyền rửa chén |
| **7** | **Phòng Chứa Bí Mật** *(Chamber of Secrets)* | Hầm ngầm cổ kính của Salazar Slytherin | **Vách tường tượng đá xếp tầng (140px)**, cánh quạt trần 4 lưỡi xoay tròn |
| **8** | **Sân lâu đài Hogwarts** *(Courtyard)* | Sân vườn lâu đài dưới ánh trăng | **Tổng hợp bẫy:** Bão tuyết, bơ trượt, quạt trần, lò xo nảy qua hào sâu |

---

## ⚙️ Bảng thông số kỹ thuật (HARD Mode Config)

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
Tổng điểm = Điểm Checkpoint + Điểm Chiếc Vớ + Điểm Về Đích + Thưởng Tốc Độ + Thưởng Cẩn Thận
```

- **Cờ Checkpoint:** `+200 điểm` mỗi cờ an toàn cả đội cùng qua.
- **Chiếc vớ tự do (The Sock):** `+500 điểm` khi chạm lấy vớ.
- **Về đích (Gate Clearance):** `+1000 điểm` khi cả đội cùng bước qua cổng vòm.
- **Thưởng Tốc độ (Speed Bonus):** `max(0, 1000 - giây * 3)` — Hoàn thành càng nhanh điểm càng cao.
- **Thưởng Cẩn thận (Care Bonus):** `max(0, 600 - số_lần_chết * 50)` — Không ngã vực bảo toàn 600 điểm tuyệt đối.
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

# Chạy toàn bộ 24 test suites
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
