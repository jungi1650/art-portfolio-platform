import express from "express";
import prisma from "../lib/prisma.js";
import upload from "../lib/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import fs from "fs";
import path from "path";

const router = express.Router();

async function uploadFileToPinata(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const data = new FormData();
  data.append("file", blob, fileName);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: data,
  });

  const rawText = await response.text();
  console.log("Pinata file upload raw response:", rawText);

  let result;
  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error(`Pinata 응답이 JSON이 아님: ${rawText}`);
  }

  if (!response.ok) {
    throw new Error(`Pinata 파일 업로드 실패: ${JSON.stringify(result)}`);
  }

  return result;
}

async function uploadJSONToPinata(jsonData) {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: JSON.stringify(jsonData),
  });

  const rawText = await response.text();
  console.log("Pinata JSON upload raw response:", rawText);

  let result;
  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error(`Pinata JSON 응답이 JSON이 아님: ${rawText}`);
  }

  if (!response.ok) {
    throw new Error(`Pinata JSON 업로드 실패: ${JSON.stringify(result)}`);
  }

  return result;
}

// 학생만 작품 업로드
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.user.role !== "student") {
        return res.status(403).json({ error: "학생만 업로드 가능" });
      }

      const { title, description, category } = req.body;

      if (!title) {
        return res.status(400).json({ error: "작품 제목은 필수입니다." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "이미지 파일 필요" });
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          userId: req.user.id,
          title,
          description,
          category: category || "기타",
          imageUrl: `/uploads/${req.file.filename}`,
        },
      });

      res.json({
        message: "포트폴리오 업로드 성공",
        portfolio,
      });
    } catch (error) {
      console.error("upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// 공개용 최신 작품 목록
router.get("/public/recent", async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                studentName: true,
                academyName: true,
              },
            },
          },
        },
      },
    });

    res.json({ portfolios });
  } catch (error) {
    console.error("public recent portfolios error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 공개용 NFT 인증 작품 목록
router.get("/public/certified", async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        isMinted: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                studentName: true,
                academyName: true,
              },
            },
          },
        },
      },
    });

    res.json({ portfolios });
  } catch (error) {
    console.error("public certified portfolios error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 공개용 전체 작품 목록 + 검색 + 카테고리 + NFT 필터
router.get("/public/list", async (req, res) => {
  try {
    const { search = "", category = "전체", minted = "all" } = req.query;

    const where = {};

    if (category && category !== "전체") {
      where.category = category;
    }

    if (minted === "true") {
      where.isMinted = true;
    }

    if (minted === "false") {
      where.isMinted = false;
    }

    const keyword = String(search).trim();

    if (keyword) {
      where.OR = [
        {
          title: {
            contains: keyword,
          },
        },
        {
          description: {
            contains: keyword,
          },
        },
        {
          category: {
            contains: keyword,
          },
        },
        {
          user: {
            studentProfile: {
              studentName: {
                contains: keyword,
              },
            },
          },
        },
      ];
    }

    const portfolios = await prisma.portfolio.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            studentProfile: {
              select: {
                studentName: true,
                academyName: true,
              },
            },
          },
        },
      },
    });

    res.json({ portfolios });
  } catch (error) {
    console.error("public portfolio list error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 학생 본인 작품 목록
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "학생만 조회 가능" });
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ portfolios });
  } catch (error) {
    console.error("my portfolios error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 학부모가 연결된 학생 작품 보기
router.get("/student/:studentId", authMiddleware, async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    if (req.user.role !== "parent") {
      return res.status(403).json({ error: "학부모만 조회 가능" });
    }

    const link = await prisma.parentLink.findFirst({
      where: {
        parentId: req.user.id,
        studentId,
      },
    });

    if (!link) {
      return res.status(403).json({ error: "연결되지 않은 학생" });
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ portfolios });
  } catch (error) {
    console.error("parent student portfolios error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 공개용 특정 작품 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const portfolioId = Number(req.params.id);

    if (Number.isNaN(portfolioId)) {
      return res.status(400).json({ error: "올바르지 않은 작품 ID입니다." });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            studentProfile: {
              select: {
                studentName: true,
                academyName: true,
              },
            },
          },
        },
      },
    });

    if (!portfolio) {
      return res.status(404).json({ error: "포트폴리오 없음" });
    }

    res.json({ portfolio });
  } catch (error) {
    console.error("get public portfolio detail error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 학생 본인 작품을 IPFS에 업로드하고 민팅용 metadata 준비
router.post("/:id/prepare-mint", authMiddleware, async (req, res) => {
  try {
    const portfolioId = Number(req.params.id);

    if (req.user.role !== "student") {
      return res.status(403).json({ error: "학생만 민팅 준비 가능" });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      return res.status(404).json({ error: "포트폴리오 없음" });
    }

    if (portfolio.userId !== req.user.id) {
      return res.status(403).json({ error: "본인 작품만 민팅 가능" });
    }

    const imagePath = path.join(
      process.cwd(),
      portfolio.imageUrl.replace(/^\/+/, "")
    );

    console.log("imagePath:", imagePath);
    console.log("file exists:", fs.existsSync(imagePath));
    console.log("PINATA_JWT exists:", !!process.env.PINATA_JWT);

    if (!fs.existsSync(imagePath)) {
      return res
        .status(404)
        .json({ error: "업로드된 이미지 파일을 찾을 수 없습니다." });
    }

    const fileUploadResult = await uploadFileToPinata(
      imagePath,
      path.basename(imagePath)
    );

    const imageIpfsHash = fileUploadResult.IpfsHash;
    const imageUrl = `ipfs://${imageIpfsHash}`;

    const metadata = {
      name: portfolio.title,
      description: portfolio.description || "",
      image: imageUrl,
      attributes: [
        {
          trait_type: "Portfolio ID",
          value: portfolio.id,
        },
        {
          trait_type: "User ID",
          value: portfolio.userId,
        },
        {
          trait_type: "Category",
          value: portfolio.category || "기타",
        },
      ],
    };

    const metadataUploadResult = await uploadJSONToPinata(metadata);

    const metadataIpfsHash = metadataUploadResult.IpfsHash;
    const metadataUrl = `ipfs://${metadataIpfsHash}`;

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ipfsHash: imageIpfsHash,
        metadataUrl,
      },
    });

    res.json({
      message: "민팅용 IPFS 업로드 완료",
      portfolio: updatedPortfolio,
      tokenURI: metadataUrl,
      ipfsHash: imageIpfsHash,
      metadataUrl,
    });
  } catch (error) {
    console.error("prepare-mint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 학생 본인 작품에 NFT 정보 저장
router.patch("/:id/mint", authMiddleware, async (req, res) => {
  try {
    const portfolioId = Number(req.params.id);
    const {
      ipfsHash,
      metadataUrl,
      tokenId,
      txHash,
      ownerAddress,
      contractAddress,
    } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({ error: "학생만 민팅 가능" });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      return res.status(404).json({ error: "포트폴리오 없음" });
    }

    if (portfolio.userId !== req.user.id) {
      return res.status(403).json({ error: "본인 작품만 민팅 가능" });
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        ipfsHash: ipfsHash || null,
        metadataUrl: metadataUrl || null,
        tokenId: tokenId ? Number(tokenId) : null,
        txHash: txHash || null,
        ownerAddress: ownerAddress || null,
        contractAddress: contractAddress || null,
        isMinted: true,
      },
    });

    res.json({
      message: "NFT 정보 저장 성공",
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error("mint save error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;