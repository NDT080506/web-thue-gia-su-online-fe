import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function AnnouncementBar() {
  return (
    <div className="announcement">
      <span className="announcement-dot" />
      <span>Buổi học đầu tiên chỉ từ 99.000đ</span>
      <Link to="/tutors">
        Tìm hiểu thêm <ArrowForwardRoundedIcon fontSize="inherit" />
      </Link>
    </div>
  );
}
