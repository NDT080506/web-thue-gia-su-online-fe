import AnnouncementBar from "../../components/home/AnnouncementBar";
import HomeHero from "../../components/home/HomeHero";
import HowItWorks from "../../components/home/HowItWorks";
import SubjectStrip from "../../components/home/SubjectStrip";
import MainLayout from "../../layouts/MainLayout";
import { getPublicTutors } from "../../services/tutorService";

export default function HomePage() {
  const tutors = getPublicTutors();

  return (
    <MainLayout announcement={<AnnouncementBar />}>
      <HomeHero tutors={tutors} />
      <SubjectStrip />
      <HowItWorks />
    </MainLayout>
  );
}