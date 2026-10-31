import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const steps = [
  {
    number: "01",
    title: "Nói điều bạn đang cần",
    description: "Môn học, mục tiêu, thời gian — bắt đầu từ điều đơn giản nhất.",
  },
  {
    number: "02",
    title: "Gặp người thầy phù hợp",
    description:
      "Xem hồ sơ, đọc đánh giá và chọn người khiến bạn thấy tin tưởng.",
  },
  {
    number: "03",
    title: "Thử một buổi học đầu tiên",
    description:
      "Trải nghiệm cách dạy trước khi cùng nhau lên lộ trình dài hơn.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="how-it-works">
      <div className="how-intro">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          Đơn giản từ buổi đầu
        </div>
        <h2>Học tốt hơn, bắt đầu từ một cuộc trò chuyện.</h2>
        <p>
          Bạn không cần biết chính xác mình cần gì. Chỉ cần bắt đầu — chúng tôi
          sẽ cùng bạn tìm ra cách học phù hợp.
        </p>
        <Link to="/tutors" className="button button-orange">
          Tìm gia sư phù hợp <ArrowForwardRoundedIcon fontSize="small" />
        </Link>
      </div>
      <div className="steps-list">
        {steps.map((step) => (
          <div className="step-item" key={step.number}>
            <span className="step-number">{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <span className="step-arrow">↗</span>
          </div>
        ))}
      </div>
    </section>
  );
}
