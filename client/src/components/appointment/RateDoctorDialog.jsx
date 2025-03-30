import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const RateDoctorDialog = ({ 
  isOpen, 
  onClose, 
  appointment 
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // Submit rating
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!appointment?.doctor?._id) {
      toast.error("Doctor information is missing");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/patients/doctors/${appointment.doctor._id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment,
          appointmentId: appointment._id
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Thank you for your feedback!");
        onClose();
      } else {
        toast.error(data.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Rate Your Experience</DialogTitle>
          <DialogDescription>
            {appointment?.doctor?.user && (
              <span>
                How was your appointment with Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}?
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium mb-2">Your Comments (Optional)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with the doctor..."
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateDoctorDialog;
