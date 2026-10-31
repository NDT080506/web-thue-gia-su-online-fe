import { useNavigate } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const subjects = ["Toán", "Tiếng Anh", "Vật lý", "Hóa học", "IELTS"];

export default function SubjectStrip() {
  const navigate = useNavigate();

  return (
    <section className="subject-strip" id="subjects">
      <div className="subject-strip-inner">
        <span className="strip-label">ĐANG ĐƯỢC QUAN TÂM</span>
        <div className="subject-links">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() =>
                navigate(`/tutors?query=${encodeURIComponent(subject)}`)
              }
            >
              {subject}
              <ArrowForwardRoundedIcon fontSize="inherit" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
