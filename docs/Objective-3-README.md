# Capstone Project Plan

## 1. Project & Team Overview

**Project Title:** PRINTSYNC: A Cloud-Based Inventory, Point-of-Sale, and AI-Assisted Analytics System for IC Printing Services

---

## Objective Plan - Objective 3: AI-Assisted Business Analytics

**Objective #:** 3  
**Owner (Member Name):** Roi C. Rendal  
**Objective Title:** AI-Assisted Business Analytics  
**Objective Description:**  
To integrate an AI-assisted analytics module that utilizes descriptive and predictive analytics to evaluate historical point-of-sale data, identify product demand trends, and forecast future inventory requirements. This module acts as a Decision Support System (DSS) for the business owner.

### 5-Week Task Breakdown

| Week | Day | Task Description | Sub-Tasks (breakdown) | Deliverable(s) | Test Suite / PR Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Week 1** | **Day 1** | Analytics Framework | • Create a data computation function to calculate core business performance KPIs from raw transaction inputs.<br>• Create an aggregation utility function to extract summary values such as total historical revenue. | • Core metrics calculation engine.<br>• KPI data parser and revenue aggregator utility. | • It should process a mock history array and return mathematically accurate metric summaries without modifying the state.<br>• It should parse and format computed numbers into a standardized currency string with a prefix symbol and two decimal places (e.g., ₱1,250.00). |
| **Week 2** | **Day 1** | Data Visualization Setup | • Integrate a charting library to visualize sales trends.<br>• Build a line chart component to display historical sales volume. | • Charting library integration.<br>• Historical sales trend chart. | • It should render a line chart that displays dates on the X-axis and total sales amount on the Y-axis.<br>• It should correctly plot multiple data points from a mock array. |
| **Week 2** | **Day 2** | AI Interaction Interface | • Build the interface container for displaying AI-generated insights. | • AI insight display area.<br>• Analysis trigger button. | • It should display a "Generating insights..." loading state while waiting for the simulated AI response.<br>• It should wrap and scroll long paragraphs of text within the AI insight box without breaking the layout. |
| **Week 3** | **Day 1** | Forecasting UI Elements | • Design the data table for displaying inventory forecasts.<br>• Create a selector for choosing the forecasting timeframe. | • Predicted demand data table.<br>• Forecasting period selector. | • It should render a table containing the "Predicted Quantity" and "Confidence Level" for each garment category.<br>• It should trigger a re-render of the forecast data when a new timeframe is selected from the dropdown. |
| **Week 3** | **Day 2** | Mathematical Logic Layer | • Implement the linear regression algorithm for demand prediction.<br>• Develop a set of math tests to verify regression accuracy. | • Linear regression math utility.<br>• Mathematical logic test suite. | • It should return a predicted value of 15 when given a trend line where x=5 and the formula is y = 2x + 5.<br>• It should return a null value or zero instead of crashing if an empty data array is provided to the function. |
| **Week 4** | **Day 1** | Data Aggregation API | • Develop backend logic to aggregate sales data by specific dates.<br>• Create an endpoint to supply formatted data to the AI service. | • Sales data aggregation service.<br>• AI-ready data supply endpoint. | • It should return a single total sales figure for a specific date by summing all related rows in the orders table.<br>• It should ensure the API output is a flat JSON object compatible with the Gemini prompt requirements. |
| **Week 4** | **Day 2** | AI Service Integration | • Securely integrate the Google Gemini API into the backend.<br>• Develop the primary communication route with the AI service. | • Secure AI API configuration.<br>• Gemini communication controller. | • It should return a standard error message if the Gemini API key is missing or invalid in the environment variables.<br>• It should successfully receive and log a natural-language string response from the Gemini API. |
| **Week 5** | **Day 1** | Context-Aware Prompting | • Build the prompt logic that converts raw stats into AI questions.<br>• Link the regression results to the AI interpretation layer. | • Dynamic AI prompt builder.<br>• Integrated AI interpretation service. | • It should generate a prompt string that includes specific numbers like "Total Sales: ₱5,000" and "Forecast: +10%."<br>• It should return a natural language recommendation from the AI that specifically mentions which items to restock. |
| **Week 5** | **Day 2** | Full System Integration | • Connect the dashboard charts to live sales database statistics.<br>• Link the "Generate Insight" flow from UI to AI to UI. | • Live-data analytics dashboard.<br>• Fully integrated AI insight flow. | • It should update the line chart with real data from the database when the dashboard page is loaded.<br>• It should successfully display Gemini's interpreted advice in the UI after the user clicks "Analyze Business." |
| **Week 6** | **Day 1** | Final Optimization & Readme | • Optimize data queries to ensure fast dashboard load times. | • Optimized analytics query logic. | • It should complete the data aggregation query in under 500ms. |
