# Capstone Project Plan

## 1. Project & Team Overview

*Project Title:* PRINTSYNC: A Cloud-Based Inventory, Point-of-Sale, and AI-Assisted Analytics System for IC Printing Services

---

## Objective Plan - Objective 2: Point-of-Sale (POS)

*Objective #:* 2  
*Owner (Member Name):* Lyell Jasmine D. Bulan  
*Objective Title:* Point-of-Sale (POS)  
*Objective Description:*  
To implement a streamlined point-of-sale (POS) system that facilitates fast customer transactions and features real-time order tracking to monitor a customer's purchase from the initial request to final completion. This module links the inventory data to sales and provides the primary input for business analytics.

### 5-Week Task Breakdown

| Week | Day | Task Description | Sub-Tasks (breakdown) | Deliverable(s) | Test Suite / PR Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| *Week 1* | *Day 1* | Core POS Interface | • Create a function to initialize the baseline transaction state structure for the sales terminal.<br>• Create a utility function to filter, validate, and retrieve selectable inventory items. | • Active transaction state manager function.<br>• Product inventory selection handler utility. | • It should cleanly instantiate an empty shopping cart state array and zeroed totals upon execution.<br>• It should execute the retrieval process and safely return valid matching item properties without throwing undefined errors. |
| *Week 2* | *Day 1* | Cart Management System | • Implement logic for adding and removing items from the cart.<br>• Create the cart item interface with quantity adjustment controls. | • Functional shopping cart state.<br>• Cart item quantity controllers. | • It should increment the quantity of an item if it is already present in the cart instead of adding a duplicate row.<br>• It should remove an item from the cart state entirely if the quantity is decremented below one. |
| *Week 2* | *Day 2* | Transaction Calculations | • Develop logic to calculate subtotals, taxes, and total amounts. | • Real-time calculation engine.<br>• Order total display component. | • It should return a grand total of 112.00 when the cart subtotal is 100.00 (assuming 12% tax). |
| *Week 3* | *Day 1* | Order Summary & Receipt | • Create the visual display for the order total in the cart footer.<br>• Build the checkout review modal for final transaction confirmation.<br>• Design the layout for digital transaction receipts. | • Checkout confirmation interface.<br>• Digital receipt template. | • It should update the grand total immediately whenever an item quantity is changed in the cart state.<br>• It should display the correct count of unique items and the final grand total within the checkout modal.<br>• It should render a receipt view that includes the current date, time, and an auto-generated transaction ID. |
| *Week 3* | *Day 2* | Sales Database & API | • Define database tables for recording orders and individual items.<br>• Develop the backend logic for saving new transaction records. | • Sales database schema.<br>• Backend route for order creation. | • It should successfully save a new order and return a 201 Created status along with the generated Order ID.<br>• It should ensure that the order_items table correctly stores the unit price at the time of sale for every item. |
| *Week 4* | *Day 1* | Automated Stock Deduction | • Implement logic to automatically reduce inventory stock upon sale.<br>• Develop an API endpoint to retrieve past transaction history. | • Stock deduction trigger logic.<br>• Transaction history retrieval route. | • It should accurately reflect the reduced stock level in the inventory table immediately after a sale is finalized.<br>• It should return a JSON list of past orders sorted by the most recent transaction timestamp. |
| *Week 4* | *Day 2* | Order Tracking Logic | • Implement order status tracking (e.g., Pending, Done).<br>• Create a visual progress indicator for active orders. | • Order status data field.<br>• Order progress tracking component. | • It should default every new order to the "Pending" status in the database upon initial creation.<br>• It should update the visual stepper state when the status value in the database is changed to "Completed." |
| *Week 5* | *Day 1* | POS-Inventory Integration | • Integrate stock availability checks into the POS selection grid.<br>• Implement post-checkout logic to reset the cart and show alerts. | • Stock-aware product selection logic.<br>• Post-checkout reset and notification system. | • It should disable the "Add to Cart" button and display an "Out of Stock" label if an item's stock count is zero.<br>• It should clear all items from the cart and reset the total to zero after a successful checkout response. |
| *Week 5* | *Day 2* | Receipt Export & E2E Testing | • Implement a feature to export receipts as downloadable files.<br>• Conduct end-to-end testing of the complete sales process. | • Receipt file export utility.<br>• End-to-end POS test report. | • It should trigger a browser download of a .txt file containing the receipt data when the user clicks "Finish."<br>• It should pass a full automated test: Select Item -> Add to Cart -> Checkout -> Verify Inventory Stock Reduced. |
| *Week 6* | *Day 1* | UI Refinement & Readme | • Add search and filtering capabilities within the POS terminal. | • Enhanced POS search functionality. | • It should filter the POS product grid to show only items matching the user's search query in real-time. |
