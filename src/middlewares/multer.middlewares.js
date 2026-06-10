import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const originalExtension = file.originalname.split(".").pop();
    const nameWithoutExt = file.originalname.split(".").slice(0, -1).join(".");

    cb(null, nameWithoutExt + "-" + uniqueSuffix + "." + originalExtension);
  },
});

export const upload = multer({
  storage,
});
