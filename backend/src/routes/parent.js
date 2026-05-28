import express from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 학부모가 학생 이메일로 연결 요청
router.post("/link-student", authMiddleware, async (req, res) => {
  try {
    const { studentEmail } = req.body;

    if (req.user.role !== "parent") {
      return res.status(403).json({ error: "학부모만 접근 가능" });
    }

    const studentUser = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });

    if (!studentUser || studentUser.role !== "student") {
      return res.status(404).json({ error: "학생 계정을 찾을 수 없음" });
    }

    const existingLink = await prisma.parentLink.findFirst({
      where: {
        parentId: req.user.id,
        studentId: studentUser.id,
      },
    });

    if (existingLink) {
      return res.status(400).json({ error: "이미 연결된 학생" });
    }

    const link = await prisma.parentLink.create({
      data: {
        parentId: req.user.id,
        studentId: studentUser.id,
      },
    });

    res.json({
      message: "학생 연결 성공",
      link,
      student: {
        id: studentUser.id,
        email: studentUser.email,
        studentName: studentUser.studentProfile?.studentName ?? null,
        academyName: studentUser.studentProfile?.academyName ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 내 자녀 목록 보기
router.get("/my-students", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "parent") {
      return res.status(403).json({ error: "학부모만 접근 가능" });
    }

    const links = await prisma.parentLink.findMany({
      where: { parentId: req.user.id },
    });

    const studentIds = links.map((link) => link.studentId);

    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: "student",
      },
      include: {
        studentProfile: true,
      },
    });

    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;