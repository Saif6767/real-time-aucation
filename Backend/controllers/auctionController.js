import Auction from "../models/Auction.js";
import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAuction = async (req, res) => {
  try {
    // Authorize: only admins may create auctions
    const tokenRole = req.user?.role;
    const userId = req.user?.id || req.user?._id;
    let isAdmin = false;

    if (tokenRole === "admin") {
      isAdmin = true;
    } else if (userId) {
      // Fallback: look up user from DB if token didn't include role
      const user = await User.findById(userId).select("role");
      if (user?.role === "admin") isAdmin = true;
    }

    if (!isAdmin) return res.status(403).json({ message: "Only admins can create auctions" });

    // proceed to create auction
  } catch (err) {
    console.error("createAuction auth check error:", err);
    return res.status(500).json({ message: "Server error during authorization check" });
  }
  try {
    const { title, description, image, startPrice, endTime } = req.body;

    // Basic validation
    if (!title || !startPrice || !endTime) {
      return res.status(400).json({ message: "title, startPrice and endTime are required" });
    }

    const parsedStartPrice = Number(startPrice);
    let parsedEndTime;
    if (typeof endTime === "string") {
      const re = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/;
      const m = endTime.match(re);
      if (m) {
        let [, y, part2, part3, hh, mm] = m;
        let mo = Number(part2);
        let d = Number(part3);
        // If month part is > 12 but day part is <= 12, assume the client sent YYYY/DD/MM and swap.
        if (mo > 12 && d <= 12) {
          const tmp = mo;
          mo = d;
          d = tmp;
          console.warn(`createAuction: detected probable YYYY/DD/MM input and swapped month/day for endTime: ${endTime}`);
        }
        // Validate month/day ranges
        if (mo < 1 || mo > 12 || d < 1 || d > 31) {
          return res.status(400).json({ message: "endTime contains invalid month or day" });
        }
        parsedEndTime = new Date(Number(y), mo - 1, d, Number(hh), Number(mm));
      } else {
        // fallback to Date parsing for ISO or other formats
        parsedEndTime = new Date(endTime);
      }
    } else {
      parsedEndTime = new Date(endTime);
    }

    if (Number.isNaN(parsedStartPrice) || parsedStartPrice < 0) {
      return res.status(400).json({ message: "startPrice must be a non-negative number" });
    }

    if (isNaN(parsedEndTime.getTime()) || parsedEndTime <= new Date()) {
      return res.status(400).json({ message: "endTime must be a valid future date" });
    }

    // Determine image URL: prefer uploaded file (req.file), fallback to image in body (URL)
    let imageUrl = image || "";
    if (req.file) {
      console.log('createAuction: received file:', req.file);
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "auctions" });
        imageUrl = result.secure_url;
        console.log('createAuction: cloudinary upload result url:', imageUrl);
      } catch (uploadErr) {
        console.error("Cloudinary upload error:", uploadErr);
        // Fail loudly so the client knows the upload failed and we can inspect server logs.
        // Remove temp file and return error.
        await fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(500).json({ message: "Image upload failed", error: uploadErr.message });
      } finally {
        // remove temp file
        fs.promises.unlink(req.file.path).catch(() => {});
      }
    }

    const auction = new Auction({
      title,
      description: description || "",
      image: imageUrl,
      startPrice: parsedStartPrice,
      currentBid: parsedStartPrice,
      endTime: parsedEndTime,
      bids: [],
    });

    await auction.save();

    return res.status(201).json(auction);
  } catch (error) {
    console.error("createAuction error:", error);
    return res.status(500).json({ message: error.message });
  }
};
