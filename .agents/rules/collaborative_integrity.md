# QUY TẮC BẢO TOÀN DỮ LIỆU & BỘ NHỚ CỘNG TÁC (COLLABORATIVE INTEGRITY RULE)

> **QUAN TRỌNG NHẤT (CRITICAL DIRECTIVE):**
> Tuyệt đối không tự ý sửa, ghi đè, hoàn tác (`git checkout`, `git restore`, `git reset`, `rm`, overwrite) bất kỳ file nào đang được người dùng hoặc agent khác chỉnh sửa trong workspace.

---

## 1. Không tự ý sửa hay hoàn tác file của người khác
- Khi thấy file có thay đổi (unstaged hoặc staged diff), **PHẢI** tôn trọng và giữ nguyên vẹn nội dung của người dùng / agent khác.
- Không bao giờ chạy các lệnh hủy thay đổi như:
  - `git checkout <file>`
  - `git restore <file>`
  - `git reset --hard`
  - `git clean -fd`
- Khi kiểm tra tính đúng đắn hoặc chạy test: Nếu code của agent khác đang trong quá trình phát triển tính năng mới (ví dụ: `HARD MODE`, `crumblingPlatforms`, `mountainPeakY`, `No Walking Zone`), không được vì pass test cũ mà tự ý revert các tính năng mới đó.

## 2. Ghi nhớ các tính năng đang phát triển của Agent/Người khác
- **HARD MODE & Vách tường cao / Vực sâu:**
  - `HARD.abyssGap`: Mở rộng vực sâu (từ 480px lên 550px - 650px).
  - `HARD.mountainPeakY`: Núi khổng lồ (độ cao lên tới 270-290, 14 bậc, yêu cầu 4 người chồng vai).
  - `Crumbling Platforms`: Sàn sập sau thời gian đứng.
  - `Standing Death`: Đứng yên quá lâu (>100 ticks) sẽ bị phạt chết, bắt buộc nhảy liên tục.
  - `Dangling & Hauling`: Không cho nhảy lên khỏi vực khi đang rơi hoặc dangling; phải kéo bạn qua dây.

## 3. Khôi phục và sao lưu (Backup & Recovery)
- Luôn kiểm tra `git status` trước bất kỳ hành động nào.
- Nếu người dùng hoặc agent khác vừa chỉnh sửa file, luôn coi đó là trạng thái mong muốn cao nhất (Source of Truth).
