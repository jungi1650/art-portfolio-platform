import express from "express";
import multer from "multer";
import path from "path";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const userSelect = {
  id: true,
  email: true,
  role: true,
  name: true,
  mentorField: true,
  bio: true,

  studentProfile: {
    select: {
      studentName: true,
      academyName: true,
    },
  },
};

const getDisplayName = (user) => {
  if (!user) return "익명";

  if (user.studentProfile?.studentName) {
    return user.studentProfile.studentName;
  }

  if (user.name) {
    return user.name;
  }

  return user.email;
};

// 게시글 목록 조회 - 공개
router.get("/posts", async (req, res) => {
  try {
    const boardType = req.query.boardType || "community";

    if (!["community", "mentoring"].includes(boardType)) {
      return res.status(400).json({ error: "올바르지 않은 게시판 유형입니다." });
    }

    const posts = await prisma.communityPost.findMany({
      where: { boardType },
      include: {
        user: {
          select: userSelect,
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      authorName: getDisplayName(post.user),
      commentCount: post.comments.length,
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 작성 - 로그인 사용자, 이미지 선택 가능
router.post(
  "/posts",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content, category, boardType = "community" } = req.body;

      if (!["community", "mentoring"].includes(boardType)) {
        return res
          .status(400)
          .json({ error: "올바르지 않은 게시판 유형입니다." });
      }

      if (
       boardType === "mentoring" &&
       !["student", "mentor"].includes(req.user.role)
        ) {
        return res
        .status(403)
        .json({ error: "학생과 멘토만 멘토링 글을 작성할 수 있습니다." });
        }

      if (!title || !content || !category) {
        return res
          .status(400)
          .json({ error: "제목, 내용, 카테고리는 필수입니다." });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const post = await prisma.communityPost.create({
        data: {
          userId: req.user.id,
          title,
          content,
          category,
          boardType,
          imageUrl,
        },
        include: {
          user: {
            select: userSelect,
          },
        },
      });

      res.json({
        message: "게시글 작성 성공",
        post: {
          ...post,
          authorName: getDisplayName(post.user),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// 게시글 상세 조회 - 공개
router.get("/posts/:id", async (req, res) => {
  try {
    const postId = Number(req.params.id);

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: userSelect,
        },
        comments: {
          include: {
            user: {
              select: userSelect,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "게시글 없음" });
    }

    const formattedComments = post.comments.map((comment) => ({
      ...comment,
      authorName: getDisplayName(comment.user),
    }));

    res.json({
      post: {
        ...post,
        authorName: getDisplayName(post.user),
        comments: formattedComments,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 댓글 작성 - 로그인 사용자
router.post("/posts/:id/comments", authMiddleware, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "댓글 내용을 입력해주세요." });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "게시글 없음" });
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId,
        userId: req.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: userSelect,
        },
      },
    });

    res.json({
      message: "댓글 작성 성공",
      comment: {
        ...comment,
        authorName: getDisplayName(comment.user),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 게시글 삭제 - 작성자만
router.delete("/posts/:id", authMiddleware, async (req, res) => {
  try {
    const postId = Number(req.params.id);

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: "게시글 없음" });
    }

    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: "작성자만 삭제 가능" });
    }

    await prisma.communityPost.delete({
      where: { id: postId },
    });

    res.json({ message: "게시글 삭제 성공" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;