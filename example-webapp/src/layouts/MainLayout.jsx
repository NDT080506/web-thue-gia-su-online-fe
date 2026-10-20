import MainFooter from "../components/layout/MainFooter";
import MainHeader from "../components/layout/MainHeader";

export default function MainLayout({ children, announcement = null }) {
  return (
    <div className="tutor-app">
      {announcement}
      <MainHeader />
      <main>{children}</main>
      <MainFooter />
    </div>
  );
}