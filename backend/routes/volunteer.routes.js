import express from "express";
import { 
  getNearbyComplaints, 
  getMyAssignments, 
  assignComplaintToSelf,
  updateComplaintStatus,
  unassignComplaint,
  resolveComplaint
} from "../controller/volunteer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadResolvedPhoto } from "../middleware/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/volunteer/nearby-complaints
 * @desc    Get complaints near volunteer's location
 * @access  Private (Volunteer only)
 */
router.get("/nearby-complaints", getNearbyComplaints);

/**
 * @route   GET /api/volunteer/my-assignments
 * @desc    Get all complaints assigned to the volunteer
 * @access  Private (Volunteer only)
 */
router.get("/my-assignments", getMyAssignments);

/**
 * @route   POST /api/volunteer/assign/:complaintId
 * @desc    Assign a complaint to self
 * @access  Private (Volunteer only)
 */
router.post("/assign/:complaintId", assignComplaintToSelf);

/**
 * @route   PATCH /api/volunteer/update-status/:complaintId
 * @desc    Update complaint status (received, in_review, resolved, rejected)
 * @access  Private (Volunteer only)
 */
router.patch("/update-status/:complaintId", updateComplaintStatus);

/**
 * @route   POST /api/volunteer/unassign/:complaintId
 * @desc    Unassign a complaint from self
 * @access  Private (Volunteer only)
 */
router.post("/unassign/:complaintId", unassignComplaint);

/**
 * @route   PATCH /api/volunteer/resolve/:complaintId
 * @desc    Resolve a complaint with mandatory proof photo upload
 * @access  Private (Volunteer only)
 */
router.patch("/resolve/:complaintId", (req, res, next) => {
  uploadResolvedPhoto.single("resolvedPhoto")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || "File upload failed." });
    }
    next();
  });
}, resolveComplaint);

export default router;
