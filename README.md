# Sockbound — Gia tinh tìm vớ (A Hogwarts Adventure)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-blue.svg)]()

> **Một chiếc vớ. Cả đội tự do.**  
> Party game co-op 2–8 người chơi lấy cảm hứng từ *PICO PARK* kết hợp thế giới phù thủy Hogwarts.
> **Chế độ chơi: VERY HARD** — Cực kỳ khó, yêu cầu coordination hoàn hảo!

---

# ⚠️ CHẾ ĐỘ CHƠI: VERY HARD

## Quy tắc vàng:

> **🚫 ĐỨNG YÊN = CHẾT!**  
> **✅ LUÔN LUÔN NHẢY!**

---

# 🚫 Cơ chế bắt buộc nhảy

## 1. Crumbling Platforms (Sàn sập)

```
     [=====]  ← Đứng lên → Bắt đầu rung
        ↓
    [======]  ← Rung rinh...
       ↓
      [===]    ← Sập sau 75 ticks!
        ↓
       💀       ← Chết nếu còn đứng!
```

## 2. Standing Death (Đứng yên = Chết)

⏱️ Đứng yên quá 100 ticks (~1.7 giây) → 💀

## 3. Narrow Platforms (Nền hẹp)

| Bình thường | VERY HARD |
|-------------|-----------|
| 95px | **40-50px** |

## 4. Massive Gaps (Vực cực rộng)

| Section | Gap Size |
|---------|----------|
| Pumpkin | **600px** |
| Gap | **580px** |
| Bounce | **580px** |
| Wind | **580px** |
| Ice | **600px** |
| After Mountain | **650px** |

---

# 🏔️ GIANT MOUNTAIN

## Thử thách: Leo núi 300px với 4 người!

```
                    ★           ← Đỉnh núi (y=270)
                   /\
                  /  \
                 / ☐  \        ← Bậc 14: 32px
                /   ☐   \
               /  ☐   ☐  \      ← Bậc 13: 36px
              /    ☐    \
             /   ☐    ☐   \    ← Bậc 12: 40px
            /      ☐      \
           /________________\    ← Mặt đất (y=570)

Độ cao: 300px
```

## Yêu cầu:

| Số người | Kết quả |
|-----------|---------|
| 1 người | Không thể qua |
| 2 người | Bậc 4-5 |
| 3 người | Bậc 9-10 |
| 4+ người | Leo lên đỉnh! |

---

# ⚙️ Thông số VERY HARD MODE

| Thông số | Giá trị |
|-----------|----------|
| Gravity | 0.85 |
| Jump Power | -10.5 |
| Spring Power | -13.5 |
| Rope Length | 140px |
| Rope Max | 220px |
| Abyss Gap | 550-650px |
| Platform Width | 40-50px |
| Crumble Time | 75 ticks |
| Standing Death | 100 ticks |
| Mountain Peak Y | 270px |

---

# 🎮 Chiến thuật sống sót & Cơ chế Pro-Gamer

1. **Luôn luôn nhảy** - Đứng yên quá 120 ticks = Chết!
2. **Chain jumping** - Platform A → Nhảy → Platform B → Nhảy liên hoàn.
3. **Crumbling strategy** - Nhảy lên → Platform rung sập → NHẢY NGAY!
4. **Mountain Stacking (Leo tháp thẳng đứng)** - Xếp chồng 3–4 tầng gia tinh để vượt tường thành và đỉnh tháp y=270.
5. **Mỏ neo ma thuật (Heavy Anchor - Phím Xuống / S / ↓)** - Gia tinh đứng trên bờ giữ phím Xuống để ghì chân tăng ma sát x5, làm điểm tựa vững chãi không bị đồng đội kéo tụt xuống vực.
6. **Đu dây con lắc (Pendulum Slingshot)** - Khi đang lơ lửng dưới vực, bấm Trái/Phải để lấy trớn đu qua lại, kết hợp đà kéo để phóng vút lên mỏm đá đối diện.
7. **Cấm nhảy giữa hư không (No Mid-Air Jump)** - Đã rơi vào vực thì không thể đạp gió nhảy lên. Bắt buộc phải nhờ đồng đội neo kéo (`Hauling`) hoặc đu con lắc!
8. **Áp lực thời gian đáy vực (Azkaban Chill - 3s Peril)** - Rơi sâu dưới vực (y ≥ 620) quá 180 ticks (~3 giây) sẽ bị sương lạnh Azkaban nuốt chửng, kích hoạt hồi sinh tại Checkpoint.

---

# 🎹 Điều khiển (8 người)

| Player | Move | Jump | Anchor (Mỏ neo) | Toss |
|--------|------|------|-----------------|------|
| P1 | A/D | W/Space | S | X |
| P2 | ←/→ | ↑ | ↓ | / |
| P3 | J/L | I | K | O |
| P4 | F/H | T | G | Y |
| P5 | Z/C | Q | S | V |
| P6 | B/M | N | H | , |
| P7 | 1/3 | 5 | 2 | 4 |
| P8 | 7/9 | + | 8 | 0 |

---

# 🚀 Hướng dẫn cài đặt

```sh
cd hogwarts-park
npm start
# http://localhost:3017
```

---

# 🌐 Triển khai

- **Vercel:** [https://hogwarts-park.vercel.app](https://hogwarts-park.vercel.app)
- **GitHub:** [qkn202/hogwarts-park](https://github.com/qkn202/hogwarts-park)

---

# 📜 Giấy phép
MIT License
