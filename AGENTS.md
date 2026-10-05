# AGENTS.md — Quy tắc làm việc & Bộ nhớ dự án Hogwarts Park (Sockbound)

## ⚠️ NGUYÊN TẮC CỐT LÕI (CORE DIRECTIVE)
1. **LƯU BỘ NHỚ KHÔNG TỰ SỬA:**
   - Tuyệt đối **KHÔNG** tự ý revert, discard, hoặc overwrite các file đã được người dùng hoặc agent khác chỉnh sửa (`git checkout`, `git restore`, `git reset`, `rm`).
   - Mọi thay đổi của người dùng hoặc agent khác phải được bảo toàn nguyên vẹn 100%.

2. **BẢO TỒN TÍNH NĂNG MỚI (NO WALKING & EXTREME HARD MODE):**
   - Agent/Người khác đang triển khai gói tính năng Hard Mode:
     - 🏔️ **Núi khổng lồ (Giant Mountain):** Độ cao lên đến `y = 270`, 14 bậc thang hẹp leo lên đỉnh, yêu cầu stacking đồng đội 3-4 người.
     - 🕳️ **Vực sâu mở rộng (Massive Abysses):** Chiều dài vực tăng lên 550px - 650px.
     - 🚫 **Không cho nhảy lên khỏi vực (No Dangling Jump):** Khi rơi xuống vực hoặc đang dangling, người chơi không thể tự nhảy trên không khí mà bắt buộc phải để đồng đội kéo (hauling) lên.
     - ⏳ **Sàn sập (Crumbling Platforms):** Đứng quá lâu sàn sẽ sập.
     - ⚡ **Standing Death (Đứng yên = Chết):** Buộc người chơi phải liên tục nhảy, phối hợp, không thể đi bộ an nhàn.

3. **CỘNG TÁC ĐỒNG BỘ:**
   - Luôn tôn trọng trạng thái hiện tại trong working tree.
   - Khi chạy kiểm thử, điều chỉnh test suite hoặc hỗ trợ cơ chế của tính năng mới thay vì xóa bỏ tính năng mới để pass test cũ.
