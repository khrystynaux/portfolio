"use client";

import BackButton from "@/components/BackButton/BackButton";
import PageHero from "@/components/PageHero/PageHero";
import Footer from "@/components/Footer/Footer";
import FunCard from "@/components/BuiltForFun/FunCard";
import { funProjects } from "@/lib/funProjects";
import { vendingRows } from "@/lib/vendingItems";
import cardStyles from "@/components/BuiltForFun/BuiltForFun.module.css";
import styles from "./page.module.css";

const carton = vendingRows.flat().find((i) => i.id === "fun")!;

export default function FunContent() {
  return (
    <>
      <BackButton />
      <main id="main-content">
        <PageHero
          pill="Built for Fun"
          title="Side projects & experiments"
          sub="Apps I’ve designed and built with React. Each one opens live in a new tab."
          color={carton.color}
          ink="#2f2a26"
        />
        <section className={styles.section} aria-label="Projects">
          <div className={styles.container}>
            <div className={cardStyles.cards}>
              {funProjects.map((project, i) => (
                <FunCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
