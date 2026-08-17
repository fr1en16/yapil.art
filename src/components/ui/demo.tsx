"use client";
import gsap from "gsap";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const projects = [
  {
    color: "#000000",
    src: "c2montreal.png",
    title: "Freight Transportation",
  },
  {
    color: "#8C8C8C",
    src: "officestudio.png",
    title: "Last-Mile Delivery",
  },
  {
    color: "#EFE8D3",
    src: "locomotive.png",
    title: "Supply Chain Optimization",
  },
  {
    color: "#706D63",
    src: "silencio.png",
    title: "24/7 Customer Support",
  },
];

const scaleAnimation = {
  closed: {
    scale: 0,
    transition: { duration: 0.4, ease: [0.32, 0, 0.67, 0] as const },
    x: "-50%",
    y: "-50%",
  },
  enter: {
    scale: 1,
    transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] as const },
    x: "-50%",
    y: "-50%",
  },
  initial: { scale: 0, x: "-50%", y: "-50%" },
};

export default function Services() {
  const [modal, setModal] = useState({ active: false, index: 0 });

  return (
    <div className="py-16 overflow-hidden bg-[#f9f9f9] text-black">
      <div className="mx-auto max-w-7xl px-5 md:px-0">
        <div className="flex justify-between">
          <h2 className="font-formal text-7xl tracking-tight">Services.</h2>
          <p className="max-w-md font-medium text-neutral-500">
            Our solutions are tailored to meet the unique challenges of modern
            supply chains, providing speed, reliability, and flexibility at
            every stage of the journey.
          </p>
        </div>
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center">
            {projects.map((project, index) => (
              <Project
                index={index}
                key={project.title}
                setModal={setModal}
                title={project.title}
              />
            ))}
          </div>
          <Modal modal={modal} projects={projects} />
        </div>
      </div>
    </div>
  );
}

function Project({
  index,
  title,
  setModal,
}: {
  index: number;
  title: string;
  setModal: React.Dispatch<React.SetStateAction<{ active: boolean; index: number }>>;
}) {
  return (
    <div
      className="group flex w-full cursor-pointer items-center justify-between border-[rgb(201,201,201)] border-t px-6 md:px-24 py-8 md:py-12 transition-all duration-200 last:border-b hover:opacity-50"
      onMouseEnter={() => setModal({ active: true, index })}
      onMouseLeave={() => setModal({ active: false, index })}
    >
      <h2 className="m-0 font-normal text-3xl md:text-6xl transition-all duration-300 group-hover:translate-x-2.5">
        {title}
      </h2>
      <p className="font-light text-sm md:text-base transition-all duration-300 group-hover:translate-x-2.5">
        Design & Development
      </p>
    </div>
  );
}

function Modal({
  modal,
  projects,
}: {
  modal: { active: boolean; index: number };
  projects: Array<{ color: string; src: string; title: string }>;
}) {
  const { active, index } = modal;
  const modalContainer = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const cursorLabel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Move Container
    const xMoveContainer = gsap.quickTo(modalContainer.current, "left", {
      duration: 0.8,
      ease: "power3",
    });
    const yMoveContainer = gsap.quickTo(modalContainer.current, "top", {
      duration: 0.8,
      ease: "power3",
    });
    // Move cursor
    const xMoveCursor = gsap.quickTo(cursor.current, "left", {
      duration: 0.5,
      ease: "power3",
    });
    const yMoveCursor = gsap.quickTo(cursor.current, "top", {
      duration: 0.5,
      ease: "power3",
    });
    // Move cursor label
    const xMoveCursorLabel = gsap.quickTo(cursorLabel.current, "left", {
      duration: 0.45,
      ease: "power3",
    });
    const yMoveCursorLabel = gsap.quickTo(cursorLabel.current, "top", {
      duration: 0.45,
      ease: "power3",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { pageX, pageY } = e;
      xMoveContainer(pageX);
      yMoveContainer(pageY);
      xMoveCursor(pageX);
      yMoveCursor(pageY);
      xMoveCursorLabel(pageX);
      yMoveCursorLabel(pageY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <motion.div
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-30 hidden md:flex h-80 w-96 items-center justify-center overflow-hidden bg-white shadow-2xl"
        initial="initial"
        ref={modalContainer}
        variants={scaleAnimation}
      >
        <div
          className="absolute h-full w-full transition-[top] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]"
          style={{ top: `${index * -100}%` }}
        >
          {projects.map((project, idx) => (
            <div
              className="flex h-full w-full items-center justify-center"
              key={project.title}
              style={{ backgroundColor: project.color }}
            >
              <img
                alt={project.title}
                className="h-auto max-h-full object-cover"
                src={`https://images.cnippet.dev/image/upload/v1770400411/img_1700${idx + 1}.jpg`}
                width={300}
              />
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-40 hidden md:flex h-20 w-20 items-center justify-center rounded-full bg-[#455CE9] font-light text-sm text-white"
        initial="initial"
        ref={cursor}
        variants={scaleAnimation}
      />
      <motion.div
        animate={active ? "enter" : "closed"}
        className="pointer-events-none fixed z-40 hidden md:flex h-20 w-20 items-center justify-center rounded-full bg-transparent font-light text-sm text-white"
        initial="initial"
        ref={cursorLabel}
        variants={scaleAnimation}
      >
        View
      </motion.div>
    </>
  );
}
