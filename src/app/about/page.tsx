import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/stagger";
import { avatarColorFor, initialsFor } from "@/lib/articles";
import { TEAM_ROLES } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="static-page">
      <p className="page-kicker">Our Story</p>
      <h1>About</h1>
      <p>
        The Warsaw High Financial Times was founded and is managed by a society of economics students who believe
        economics and finance shouldn&apos;t be limited by jargon and prior knowledge. From starting as articles about
        markets, macroeconomics and financial news headlines that nobody around us seemed to fully understand, we built
        you a medium where complicated concepts and mechanisms get broken down into ideas any can follow.
      </p>
      <p>
        Our wish is to continue writing for all curious students looking to broaden their knowledge within economics,
        finance, and the world of business around them.
      </p>
      <blockquote className="pull-quote about-pull-quote">
        Complicated concepts and mechanisms, broken down into ideas any can follow.
      </blockquote>
      <h2>How we publish</h2>
      <p>
        New issues are published roughly every one to two weeks, aiming to capture the latest and most consequential
        economic developments worldwide, not limited exclusively to the Warsaw area. Every article credits its author and
        the sources behind it.
      </p>
      <h2>Our team</h2>
      <FadeIn>
        <ul className="team-list">
          {Object.entries(TEAM_ROLES).map(([name, info]) => (
            <li key={name}>
              <span className="team-avatar" style={{ background: avatarColorFor(name) }}>
                {initialsFor(name)}
              </span>
              <span className="team-text">
                <span className="team-name">{name}</span>
                <span className="team-title">{info.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </FadeIn>
    </section>
  );
}
