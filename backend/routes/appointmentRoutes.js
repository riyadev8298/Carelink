
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Appointment = require("../models/Appointment");
const Caregiver = require("../models/Caregiver");

// Helper to get today's date in YYYY-MM-DD
const getTodayString = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// =====================================================
// 1. BOOK APPOINTMENT
// =====================================================

router.post("/add", async (req, res) => {
    try {
        console.log("RECEIVED APPOINTMENT BOOKING REQUEST:", req.body);

        const {
            caregiverId,
            caregiverName,
            service,
            appointmentDate,
            appointmentTime,
            duration,
            userName,
            userEmail,
            phone,
            address,
            specialInstructions,
            charges,
            priceType
        } = req.body;


        // -------------------------------------------------
        // REQUIRED FIELD CHECK
        // -------------------------------------------------

        if (
            !caregiverName ||
            !service ||
            !appointmentDate ||
            !appointmentTime ||
            !userName ||
            !phone ||
            !address
        ) {
            return res.status(400).json({
                message:
                    "Please fill in all required appointment fields (Caregiver, Service, Date, Time, Patient Name, Phone, and Address)."
            });
        }


        // -------------------------------------------------
        // CHECK PAST DATE
        // -------------------------------------------------

        const todayStr = getTodayString();

        if (appointmentDate < todayStr) {
            return res.status(400).json({
                message:
                    `Appointment date cannot be in the past. Today is ${todayStr}.`
            });
        }


        // -------------------------------------------------
        // FIND CAREGIVER
        // -------------------------------------------------

        let caregiver = null;

        if (
            caregiverId &&
            mongoose.Types.ObjectId.isValid(caregiverId)
        ) {
            try {
                caregiver = await Caregiver.findById(caregiverId);
            } catch (err) {
                console.log(
                    "Caregiver ID lookup warning:",
                    err.message
                );
            }
        }


        // If ID did not find caregiver, search by name
        if (!caregiver && caregiverName) {
            caregiver = await Caregiver.findOne({
                name: caregiverName
            });
        }


        // Caregiver must exist
        if (!caregiver) {
            return res.status(404).json({
                message: "Caregiver not found."
            });
        }


        // =================================================
        // IMPORTANT FIX
        // =================================================
        // DO NOT CHECK caregiver.available HERE.
        //
        // We check availability according to:
        // Caregiver + Date + Time
        //
        // This means:
        // Same caregiver + same date + same time = NOT allowed
        // Same caregiver + different date/time = allowed
        // =================================================


        // -------------------------------------------------
        // CHECK EXISTING APPOINTMENT
        // -------------------------------------------------

        const existingAppointment = await Appointment.findOne({
            caregiverId: caregiver._id,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime,

            status: {
                $in: [
                    "Pending",
                    "Confirmed",
                    "Active"
                ]
            }
        });


        if (existingAppointment) {
            return res.status(400).json({
                message:
                    "This caregiver is already booked for the selected date and time. Please choose another time."
            });
        }


        // -------------------------------------------------
        // CREATE APPOINTMENT
        // -------------------------------------------------

        const appointment = new Appointment({

            caregiverId: caregiver._id,

            caregiverName: caregiver.name,

            service: service,

            appointmentDate: appointmentDate,

            appointmentTime: appointmentTime,

            duration: duration || "1 hour",

            userName: userName.trim(),

            userEmail: userEmail
                ? userEmail.trim().toLowerCase()
                : "",

            phone: phone.trim(),

            address: address.trim(),

            specialInstructions:
                specialInstructions
                    ? specialInstructions.trim()
                    : "",

            charges: Number(charges) || 0,

            priceType: priceType || "Free",

            status: "Confirmed"
        });


        // -------------------------------------------------
        // SAVE APPOINTMENT
        // -------------------------------------------------

        await appointment.save();

        console.log(
            "APPOINTMENT SAVED SUCCESSFULLY:",
            appointment._id
        );


        // -------------------------------------------------
        // IMPORTANT:
        // DO NOT MAKE CAREGIVER GLOBALLY UNAVAILABLE
        // -------------------------------------------------

        // We intentionally DO NOT do:
        //
        // caregiver.available = false;
        // await caregiver.save();
        //
        // because availability depends on appointment
        // date and time.


        return res.status(201).json({

            message: "Appointment booked successfully.",

            appointment: appointment
        });


    } catch (error) {

        console.error(
            "BOOK APPOINTMENT ERROR:",
            error
        );

        return res.status(500).json({

            message: "Failed to book appointment",

            error: error.message
        });
    }
});


// =====================================================
// 2. GET APPOINTMENTS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const {
            userEmail,
            userName
        } = req.query;

        const query = {};


        if (userEmail) {

            query.userEmail =
                userEmail.trim().toLowerCase();

        } else if (userName) {

            query.userName =
                userName.trim();
        }


        const appointments =
            await Appointment
                .find(query)
                .sort({ _id: -1 });


        return res.json(appointments);


    } catch (error) {

        console.error(
            "GET APPOINTMENTS ERROR:",
            error
        );

        return res.status(500).json({

            message: "Failed to fetch appointments",

            error: error.message
        });
    }
});


// =====================================================
// 3. RESCHEDULE APPOINTMENT
// =====================================================

router.put("/:id/reschedule", async (req, res) => {

    try {

        const {
            appointmentDate,
            appointmentTime
        } = req.body;


        // Required fields
        if (
            !appointmentDate ||
            !appointmentTime
        ) {

            return res.status(400).json({

                message:
                    "Please provide both new appointment date and time."
            });
        }


        // Cannot select past date
        const todayStr = getTodayString();

        if (appointmentDate < todayStr) {

            return res.status(400).json({

                message:
                    "Rescheduled date cannot be in the past."
            });
        }


        // Find appointment
        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {

            return res.status(404).json({

                message:
                    "Appointment not found."
            });
        }


        // -------------------------------------------------
        // CHECK WHETHER NEW TIME IS ALREADY BOOKED
        // -------------------------------------------------

        const existingAppointment =
            await Appointment.findOne({

                caregiverId:
                    appointment.caregiverId,

                appointmentDate:
                    appointmentDate,

                appointmentTime:
                    appointmentTime,

                status: {
                    $in: [
                        "Pending",
                        "Confirmed",
                        "Active"
                    ]
                },

                _id: {
                    $ne: appointment._id
                }
            });


        if (existingAppointment) {

            return res.status(400).json({

                message:
                    "This caregiver is already booked for the selected date and time. Please choose another time."
            });
        }


        // Update date
        appointment.appointmentDate =
            appointmentDate;


        // Update time
        appointment.appointmentTime =
            appointmentTime;


        // If previously cancelled, confirm again
        if (
            appointment.status === "Cancelled"
        ) {

            appointment.status =
                "Confirmed";
        }


        await appointment.save();


        return res.json({

            message:
                "Appointment rescheduled successfully.",

            appointment:
                appointment
        });


    } catch (error) {

        console.error(
            "RESCHEDULE APPOINTMENT ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to reschedule appointment",

            error:
                error.message
        });
    }
});


// =====================================================
// 4. CANCEL APPOINTMENT
// =====================================================

router.put("/:id/cancel", async (req, res) => {

    try {

        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {

            return res.status(404).json({

                message:
                    "Appointment not found."
            });
        }


        // Change status
        appointment.status =
            "Cancelled";


        await appointment.save();


        // -------------------------------------------------
        // Restore caregiver availability
        // -------------------------------------------------

        let caregiver = null;


        if (
            appointment.caregiverId &&
            mongoose.Types.ObjectId.isValid(
                appointment.caregiverId
            )
        ) {

            try {

                caregiver =
                    await Caregiver.findById(
                        appointment.caregiverId
                    );

            } catch (err) {

                console.log(
                    "Caregiver ID lookup warning on cancel:",
                    err.message
                );
            }
        }


        // Fallback to caregiver name
        if (
            !caregiver &&
            appointment.caregiverName
        ) {

            caregiver =
                await Caregiver.findOne({

                    name:
                        appointment.caregiverName
                });
        }


        if (caregiver) {

            caregiver.available = true;

            await caregiver.save();
        }


        return res.json({

            message:
                "Appointment cancelled successfully.",

            appointment:
                appointment
        });


    } catch (error) {

        console.error(
            "CANCEL APPOINTMENT ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to cancel appointment",

            error:
                error.message
        });
    }
});


// =====================================================
// 5. UPDATE APPOINTMENT STATUS
// =====================================================

router.put("/:id/status", async (req, res) => {

    try {

        const { status } =
            req.body;


        const validStatuses = [

            "Pending",

            "Confirmed",

            "Active",

            "Completed",

            "Cancelled"
        ];


        // Check valid status
        if (
            !status ||
            !validStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    `Invalid status. Valid options are: ${validStatuses.join(", ")}`
            });
        }


        // Find appointment
        const appointment =
            await Appointment.findById(
                req.params.id
            );


        if (!appointment) {

            return res.status(404).json({

                message:
                    "Appointment not found."
            });
        }


        // Update status
        appointment.status =
            status;


        await appointment.save();


        // -------------------------------------------------
        // If appointment is completed/cancelled,
        // caregiver can be shown as available again.
        // -------------------------------------------------

        if (
            status === "Completed" ||
            status === "Cancelled"
        ) {

            let caregiver = null;


            if (
                appointment.caregiverId &&
                mongoose.Types.ObjectId.isValid(
                    appointment.caregiverId
                )
            ) {

                try {

                    caregiver =
                        await Caregiver.findById(
                            appointment.caregiverId
                        );

                } catch (err) {

                    console.log(
                        "Caregiver ID lookup warning on status change:",
                        err.message
                    );
                }
            }


            // Fallback by name
            if (
                !caregiver &&
                appointment.caregiverName
            ) {

                caregiver =
                    await Caregiver.findOne({

                        name:
                            appointment.caregiverName
                    });
            }


            if (caregiver) {

                caregiver.available = true;

                await caregiver.save();
            }
        }


        return res.json({

            message:
                `Appointment status updated to ${status}.`,

            appointment:
                appointment
        });


    } catch (error) {

        console.error(
            "UPDATE STATUS ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to update appointment status",

            error:
                error.message
        });
    }
});


// =====================================================
// 6. DELETE APPOINTMENT
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        const appointment =
            await Appointment.findByIdAndDelete(
                req.params.id
            );


        if (!appointment) {

            return res.status(404).json({

                message:
                    "Appointment not found."
            });
        }


        return res.json({

            message:
                "Appointment deleted successfully."
        });


    } catch (error) {

        console.error(
            "DELETE APPOINTMENT ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to delete appointment",

            error:
                error.message
        });
    }
});


module.exports = router;

