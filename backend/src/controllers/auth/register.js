import prisma from "../../lib/prisma.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      studentName,
      academyName,
      name,
      mentorField,
      bio,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "이메일, 비밀번호, 역할은 필수입니다." });
    }

    if (!["student", "parent", "mentor"].includes(role)) {
      return res.status(400).json({ error: "올바르지 않은 사용자 역할입니다." });
    }

    if (role === "student" && !studentName) {
      return res.status(400).json({ error: "학생 이름은 필수입니다." });
    }

    if (role === "parent" && !name) {
      return res.status(400).json({ error: "학부모 이름은 필수입니다." });
    }

    if (role === "mentor" && !name) {
      return res.status(400).json({ error: "멘토 이름은 필수입니다." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "이미 존재하는 이메일" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          name: role === "student" ? studentName : name,
          mentorField: role === "mentor" ? mentorField : null,
          bio: role === "mentor" ? bio : null,
        },
      });

      if (role === "student") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            studentName,
            academyName,
          },
        });
      }

      return user;
    });

    res.json({ message: "회원가입 성공", user: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};