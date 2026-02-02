/**
 * Power BI Dashboard Hub - Configuration
 * 
 * HOW TO ADD DASHBOARDS:
 * 1. In Power BI Service, go to File > Embed report > Publish to web
 * 2. Copy the embed URL from the iframe src (looks like: https://app.powerbi.com/view?r=...)
 * 3. Paste it as the "embedUrl" value below
 */

const DASHBOARD_CONFIG = {
    categories: [
        {
            id: "production",
            name: "Production",
            description: "Production metrics and line performance",
            icon: "📊",
            dashboards: [
                {
                    id: "Nozzle",
                    title: "Nozzle",
                    purpose: "Real-time line performance metrics",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiZjBiNmIxZjctOTJiNy00MDE3LWIxODctYjBkNWQ0YjgxZWEzIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "Rail",
                    title: "Rail",
                    purpose: "Daily production, Quality KPIs and targets",
                    // Paste your "Publish to Web" embed URL here
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDYwMjAxYTktODFiMS00Y2FjLWI1NTQtYTBjMDk3YjBkMWYxIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "Injector",
                    title: "Injector",
                    purpose: "Injector",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODEzMzVhZDctYTM5OC00Yjk0LWE1NmUtODA3ODlmM2MyNmM2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "Filter",
                    title: "Filter",
                    purpose: "Filter",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYmQ1MzE4ZDUtYjBmYS00OTk1LTlhOTgtODBiMzhjZTE0YzlmIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "DFP6",
                    title: "DFP6",
                    purpose: "DFP6",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNGNjYTg2YjktY2RkNi00YzNjLTk0NTktNzAxYjEyMzhhY2M2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "DFP1",
                    title: "DFP1",
                    purpose: "DFP1",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzE5YTEwZTUtZWYxYi00MWMwLWJhNGUtYWUwNWRiMDk5NTJlIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "DFP4",
                    title: "DFP4",
                    purpose: "DFP4",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDFlYTRlYmItNmU0NC00MjMzLTg1ZGYtYTRmNjYyYzNkZGE2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "UPCR",
                    title: "UPCR",
                    purpose: "UPCR",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzRlNDEyNmEtNDY1ZC00NmE2LTkzYjUtMjI5ZWMzYjNiMDA5IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                }
            ]
        },
        {
            id: "cost",
            name: "Cost",
            description: "Cost drivers and loss analysis",
            icon: "💰",
            dashboards: [
                {
                    id: "cost_overview",
                    title: "Cost Overview",
                    purpose: "Overall cost breakdown and trends",
                    embedUrl: "https://app.powerbi.com/view?r=YOUR_EMBED_TOKEN_HERE"
                },
                {
                    id: "loss_analysis",
                    title: "Loss Analysis",
                    purpose: "Identify and track cost leakages",
                    embedUrl: "https://app.powerbi.com/view?r=YOUR_EMBED_TOKEN_HERE"
                }
            ]
        },
        {
            id: "wip",
            name: "WIP",
            description: "Work in progress tracking",
            icon: "🔄",
            dashboards: [
                {
                    id: "wip_tracker",
                    title: "WIP Tracker",
                    purpose: "Current work-in-progress status",
                    embedUrl: "https://app.powerbi.com/view?r=YOUR_EMBED_TOKEN_HERE"
                },
                {
                    id: "inventory_flow",
                    title: "Inventory Flow",
                    purpose: "Material movement and staging",
                    embedUrl: "https://app.powerbi.com/view?r=YOUR_EMBED_TOKEN_HERE"
                }
            ]
        },
        {
            id: "accuracy",
            name: "Accuracy",
            description: "Quality and accuracy metrics",
            icon: "✅",
            dashboards: [
                {
                    id: "quality_dashboard",
                    title: "Quality Dashboard",
                    purpose: "Defect rates and quality trends",
                    embedUrl: "https://app.powerbi.com/view?r=YOUR_EMBED_TOKEN_HERE"
                },
                {
                    id: "inspection_results",
                    title: "Inspection Results",
                    purpose: "Detailed inspection data analysis",
                    embedUrl: "https://app.powerbi.com/view?r=YOUR_EMBED_TOKEN_HERE"
                }
            ]
        }
    ]
};

// Power BI embed configuration
const POWERBI_CONFIG = {
    // Transition duration in milliseconds (fade effect when switching dashboards)
    transitionDuration: 200
};
