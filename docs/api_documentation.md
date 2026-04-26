# API Documentation - CampusNexus Booking Management

This document provides the technical specifications for the Booking CRUD operations as per the required project format.

---

## 1. Student Booking Operations

### GET – View All User Bookings
**URL:** `http://localhost:8081/api/bookings?userId={id}`  
**Resource:** Student Booking API  
**Request:** `GET /api/bookings?userId={id}`  
**Media:** `APPLICATION_JSON`  

**Response:**
```json
[
  {
    "bookingCode": "BKG-A1B2C3D4",
    "resourceId": "FAC-001",
    "bookingDate": "2026-05-15",
    "startTime": "09:00",
    "endTime": "11:00",
    "status": "APPROVED"
  }
]
```
*"Error while reading the bookings."*

---

### POST – Create New Booking Requisition
**URL:** `http://localhost:8081/api/bookings`  
**Resource:** Student Booking API  
**Request:** `POST /api/bookings`  
**Media:** `APPLICATION_JSON`  

**Response:**
*"Inserted successfully"*  
*"Error while inserting the Booking."*

---

### PUT – Update Booking Details (PENDING Only)
**URL:** `http://localhost:8081/api/bookings/{bookingId}`  
**Resource:** Student Booking API  
**Request:** `PUT /api/bookings/{bookingId}`  
**Media:** `APPLICATION_JSON`  

**Response:**
*"Updated successfully"*  
*"Error while updating the Booking."*

---

### DELETE (PATCH) – Cancel Booking Reservation (Soft Delete)
**URL:** `http://localhost:8081/api/bookings/{bookingId}/cancel`  
**Resource:** Student Booking API (CRUD: DELETE)  
**Request:** `PATCH /api/bookings/{bookingId}/cancel`  
**Media:** `APPLICATION_JSON`  

**Response:**
*"Cancelled successfully"*  
*"Error while cancelling the Booking."*

---

## 2. Administrative Booking Operations

### GET – View All System Reservations (Admin Log)
**URL:** `http://localhost:8081/api/admin/bookings`  
**Resource:** Admin Management API  
**Request:** `GET /api/admin/bookings`  
**Media:** `APPLICATION_JSON`  

**Response:**
```json
{
    "id": "105",
    "bookingCode": "BKG-F9E8D7C6",
    "studentName": "John Doe",
    "studentRegNumber": "IT21804432",
    "resourceId": "AUD-01",
    "status": "PENDING"
}
```
*"Error while fetching reservation log."*

---

### PATCH – Approve Pending Reservation
**URL:** `http://localhost:8081/api/admin/bookings/{id}/approve`  
**Resource:** Admin Management API  
**Request:** `PATCH /api/admin/bookings/{id}/approve`  
**Media:** `APPLICATION_JSON`  

**Response:**
*"Approved successfully"*  
*"Error while processing approval."*

---

### PATCH – Reject Pending Reservation
**URL:** `http://localhost:8081/api/admin/bookings/{id}/reject`  
**Resource:** Admin Management API  
**Request:** `PATCH /api/admin/bookings/{id}/reject`  
**Media:** `APPLICATION_JSON`  

**Response:**
*"Rejected successfully"*  
*"Error while processing rejection."*

---

### POST – Record Facility Check-in (QR Scanner)
**URL:** `http://localhost:8081/api/admin/bookings/check-ins`  
**Resource:** Admin Management API  
**Request:** `POST /api/admin/bookings/check-ins`  
**Media:** `APPLICATION_JSON`  

**Response:**
```json
{
    "checkInId": "CHK-9921",
    "status": "VERIFIED",
    "time": "2026-04-23T14:30:00"
}
```
*"Invalid Token: Error while checking in."*
