# Selling to Us (Pawn Enquiries)

Customers can initiate a pawn enquiry online via our mobile-friendly form. This allows for a preliminary quote before visiting the store.

## The Enquiry Form
Located at `/pawn/sell`, the form is designed for one-handed mobile use (**Makoonsii** persona).

### Required Information
- **Contact Details:** Name and Email (Phone is optional but recommended).
- **Item Description:** A brief summary of the item's condition and features.
- **Photos:** Customers can upload photos directly from their mobile camera.
- **Serial Number:** Optional, but highly recommended for faster processing.

## Security & Blacklist Check
Every submission is automatically screened by a server-side **Serial Blacklist Check**.
1.  The system compares the provided serial number against our database of reported stolen items.
2.  If a match is found, the request is internally flagged as a `Blacklist Hit`.
3.  The staff is alerted immediately in the admin inbox.
