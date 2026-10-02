import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

function ReviewSection({
  caregiver,
  currentUser,
  reviewAppointment = null,
  showFormInitially = false,
  onReviewSubmitted
}) {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] =
    useState(showFormInitially);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch reviews of caregiver
  const fetchReviews = async () => {
    if (!caregiver?._id) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/reviews/caregiver/${caregiver._id}`
      );

      setReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (!caregiver?._id) return;
    let ignore = false;

    axios
      .get(`${API_BASE_URL}/reviews/caregiver/${caregiver._id}`)
      .then((res) => {
        if (!ignore) {
          setReviews(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        if (!ignore) {
          setReviews([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [caregiver?._id]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, item) => total + Number(item.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // Submit review
  const submitReview = async () => {
    if (!currentUser) {
      alert("Please Login or Register first.");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write your review.");
      return;
    }

    if (!caregiver?._id) {
      alert("Caregiver information is missing.");
      return;
    }

    try {
      setReviewLoading(true);

      await axios.post(`${API_BASE_URL}/reviews/add`, {
        caregiverId: caregiver._id,
        caregiverName: caregiver.name,
        userName: currentUser.name,
        userEmail: currentUser.email || "",
        rating: reviewRating,
        review: reviewText.trim()
      });

      alert("Review submitted successfully! ⭐");

      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);

      await fetchReviews();

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Review submission error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="reviews-section">

      {/* Heading */}
      <div className="reviews-header">
        <h3>⭐ Reviews & Ratings</h3>

        <div className="average-rating">
          <strong>{averageRating}/5</strong>
          <span> ⭐</span>
          <small>
            {reviews.length}{" "}
            {reviews.length === 1 ? "Review" : "Reviews"}
          </small>
        </div>
      </div>

      {/* Give Review Button */}
      {currentUser && (
        <button
          className="primary-btn"
          onClick={() => setShowReviewForm(true)}
        >
          ⭐ Give Review & Rating
        </button>
      )}

      {!currentUser && (
        <p className="review-login-message">
          Please Login or Register to give a review.
        </p>
      )}

      {/* Review List */}
      <div className="review-list">

        {reviews.length === 0 ? (
          <p className="no-reviews">
            No reviews yet. Be the first to review this caregiver!
          </p>
        ) : (
          reviews.map((item) => (
            <div className="review-card" key={item._id}>

              <div className="review-card-top">
                <strong>{item.userName}</strong>

                <span className="review-stars">
                  {"⭐".repeat(Number(item.rating || 0))}
                </span>
              </div>

              <p>{item.review}</p>

              {item.createdAt && (
                <small>
                  {new Date(item.createdAt).toLocaleDateString()}
                </small>
              )}
            </div>
          ))
        )}

      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="review-modal-overlay">

          <div className="review-modal">

            <div className="review-modal-header">
              <h3>⭐ Give Your Review</h3>

              <button
                className="close-btn"
                onClick={() => setShowReviewForm(false)}
              >
                ✕
              </button>
            </div>

            <p>
              Caregiver: <strong>{caregiver?.name}</strong>
            </p>

            {reviewAppointment && (
              <p>
                Appointment:{" "}
                <strong>
                  {reviewAppointment.appointmentDate}
                </strong>
              </p>
            )}

            {/* Rating */}
            <label>
              <strong>Your Rating</strong>
            </label>

            <div className="big-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={
                    star <= reviewRating
                      ? "star active"
                      : "star"
                  }
                  onClick={() => setReviewRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>

            <p>
              Selected Rating:{" "}
              <strong>{reviewRating}/5</strong>
            </p>

            {/* Review Text */}
            <label>
              <strong>Your Review</strong>
            </label>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your experience with this caregiver..."
              rows="5"
            />

            {/* Buttons */}
            <div className="review-modal-actions">

              <button
                className="secondary-btn"
                onClick={() => setShowReviewForm(false)}
                disabled={reviewLoading}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={submitReview}
                disabled={reviewLoading}
              >
                {reviewLoading
                  ? "Submitting..."
                  : "Submit Review ⭐"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ReviewSection;