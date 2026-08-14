import { Subject } from "@/types";

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "CS",
    description:
      "Covers programming fundamentals, problem solving, and the basic ideas behind modern computing systems.",
    createdAt: "2026-08-14T08:00:00.000Z",
  },
  {
    id: 2,
    code: "MATH220",
    name: "Linear Algebra",
    department: "Math",
    description:
      "Introduces vectors, matrices, determinants, and the linear transformations used throughout science and engineering.",
    createdAt: "2026-08-14T08:00:00.000Z",
  },
  {
    id: 3,
    code: "ENG305",
    name: "Academic Writing and Rhetoric",
    department: "English",
    description:
      "Builds clear analytical writing, research-based argumentation, and effective communication for academic contexts.",
    createdAt: "2026-08-14T08:00:00.000Z",
  },
];

