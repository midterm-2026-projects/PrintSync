# Capstone Project Plan

## 1. Project & Team Overview

*Project Title:* PRINTSYNC: A Cloud-Based Inventory, Point-of-Sale, and AI-Assisted Analytics System for IC Printing Services

---

## Objective Plan - Objective 1: Inventory Management

*Objective #:* 1  
*Owner (Member Name):* Ma. Erica Z. Vidal  
*Objective Title:* Inventory Management  
*Objective Description:*  
To develop a comprehensive inventory management module that features a digital image repository for storing, organizing, and monitoring custom print design images alongside item stock levels. This module serves as the primary data source for the POS and AI Analytics components.

### 5-Week Task Breakdown

| Week | Day | Task Description | Sub-Tasks (breakdown) | Deliverable(s) | Test Suite / PR Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Week 1* | *Day 1* | Module Layout & Card UI | • Create a core initialization function to instantiate the baseline inventory collection array.<br>• Create a data utility function to format incoming garment and material specification objects. | • Centralized inventory initialization function.<br>• Garment and material data parser utility. | • It should return an empty array or valid initialized state structure when the initialization function is executed.<br>• It should properly extract and return the correct product name and stock quantity variables passed into the formatting function. |
| *Week 2* | *Day 1* | Input Forms & Validation | • Develop the user interface for the "Add New Item" form.<br>• Implement client-side validation for item names and stock counts. | • Interactive item entry form.<br>• Form validation logic. | • It should prevent form submission and display an error message if the "Item Name" field is empty.<br>• It should reject negative numbers in the "Initial Stock" input field. |
| *Week 2* | *Day 2* | Design Gallery UI | • Create a grid-based gallery to display custom sublimation designs. | • Design image repository interface.<br>• High-resolution image previewer. | • It should display design thumbnails in a consistent 150x150px aspect ratio grid.<br>• It should open a modal containing the full-resolution version of the design when a thumbnail is clicked. |
| *Week 3* | *Day 1* | Data Filtering System | • Implement a text-based search bar to find items by name.<br>• Create a category-based filtering system for different garment types. | • Real-time search functionality.<br>• Category-based filter menu. | • It should filter the item list in real-time, showing only items that contain the search string "Cotton" regardless of letter case.<br>• It should hide all items except those matching the "Garment" category when the corresponding filter is selected. |
| *Week 3* | *Day 2* | Database & Data Retrieval | • Define the cloud database schema for items and design repositories.<br>• Develop the server-side logic to fetch item lists from the database. | • Documented database schema for inventory.<br>• Backend endpoint for data retrieval. | • It should return a JSON array of items with a 200 OK status code when the inventory endpoint is called.<br>• It should ensure each item object in the database contains a non-null ID and a defined stock integer. |
| *Week 4* | *Day 1* | Stock Update Logic | • Implement the backend endpoint for adding new items to the system.<br>• Develop logic for manual stock level adjustments via the server. | • Backend route for item creation.<br>• Backend route for stock updates. | • It should return the newly created item object with a 201 Created status after a successful POST request.<br>• It should update the stock value in the database and return the updated count when a PATCH request is sent. |
| *Week 4* | *Day 2* | Cloud Storage Integration | • Configure the cloud bucket for storing design and garment images.<br>• Develop the backend utility for handling secure image uploads. | • Configured cloud storage bucket.<br>• Image upload handling service. | • It should successfully upload a valid image file and return a URL string that starts with the bucket's public domain.<br>• It should reject file uploads that exceed 5MB or are not in standard image formats (JPG, PNG). |
| *Week 5* | *Day 1* | Live Data Synchronization | • Connect the inventory form to the backend creation endpoint.<br>• Link the item cards to fetch real-time data from the cloud database. | • Fully integrated item creation flow.<br>• Dynamic item cards powered by live data. | • It should successfully add a new item to the database and update the UI list without requiring a full page refresh.<br>• It should render the "Empty State" component if the backend returns an empty array for the inventory list. |
| *Week 5* | *Day 2* | Status Alerts & E2E Testing | • Implement indicators for low-stock or out-of-stock items.<br>• Conduct end-to-end testing of the full inventory management cycle. | • Low-stock notification system.<br>• End-to-end inventory test report. | • It should render a "Low Stock" warning on any item where the stock count is less than 10 units.<br>• It should pass the full Playwright/Cypress flow of: Add Item -> Search for Item -> Update Stock -> Verify Changes. |
| *Week 6* | *Day 1* | Optimization & Readme | • Refactor the data-fetching logic for better performance. | • Optimized inventory code logic. | • It should execute exactly one API call to fetch inventory data upon the initial mounting of the Dashboard component. |
