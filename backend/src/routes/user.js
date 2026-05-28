import express from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import bcrypt from "bcrypt";

const router = express.Router();

const userSelect = {
  id: true,
  email: true,
  role: true,
  name: true,
  mentorField: true,
  bio: true,
  walletAddress: true,
  createdAt: true,
  studentProfile: {
    select: {
      studentName: true,
      academyName: true,
      isApproved: true,
    },
  },
};

// 내 지갑 주소 저장 / 수정
router.patch("/wallet", authMiddleware, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "지갑 주소가 필요합니다." });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        walletAddress: normalizedAddress,
      },
      select: userSelect,
    });

    res.json({
      message: "지갑 주소 저장 성공",
      user: updatedUser,
    });
  } catch (error) {
    console.error("save wallet error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 내 지갑 주소 조회
router.get("/me/wallet", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        walletAddress: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error("get wallet error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 프로필 수정
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, mentorField, bio, walletAddress } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        mentorField,
        bio,
        walletAddress: walletAddress ? walletAddress.toLowerCase() : undefined,
      },
      select: userSelect,
    });

    res.json({
      message: "프로필 수정 성공",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 비밀번호 변경
router.patch("/profile/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "현재 비밀번호와 새 비밀번호가 필요합니다." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "새 비밀번호는 6자 이상이어야 합니다." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "사용자 없음" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ error: "현재 비밀번호가 일치하지 않습니다." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ message: "비밀번호가 변경되었습니다." });
  } catch (error) {
    console.error("change password error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 지갑 삭제
router.delete("/wallet", authMiddleware, async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        walletAddress: null,
      },
      select: userSelect,
    });

    res.json({
      message: "지갑 주소가 삭제되었습니다.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("delete wallet error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 내 정보 조회
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ error: "사용자 없음" });
    }

    res.json({ user });
  } catch (error) {
    console.error("get me error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;