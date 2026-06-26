import Nav from "@/components/Nav/Nav";
import Hero from "@/components/Hero/Hero";
import CaseStudies from "@/components/CaseStudies/CaseStudies";
import BuiltForFun from "@/components/BuiltForFun/BuiltForFun";
import Tools from "@/components/Tools/Tools";
import About from "@/components/About/About";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <CaseStudies />
        <BuiltForFun />
        <Tools />
        <About />
      </main>
      <Footer />
    </>
  );
}
