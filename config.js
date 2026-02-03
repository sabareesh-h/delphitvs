/**
 * Power BI Dashboard Hub - Configuration
 * 
 * HOW TO ADD DASHBOARDS:
 * 1. In Power BI Service, go to File > Embed report > Publish to web
 * 2. Copy the embed URL from the iframe src (looks like: https://app.powerbi.com/view?r=...)
 * 3. Paste it as the "embedUrl" value below
 * 
 * HOW TO LINK TO SPECIFIC PAGES (Sub-pages / Groups):
 * 1. Open your published report in a browser.
 * 2. Navigate to the specific page (e.g., "Quality Level 2").
 * 3. Look at the URL and find "&pageName=".
 * 4. Copy the ID that follows (e.g., ReportSection123abc...).
 * 5. Set this value as "pageName" in the dashboard object settings.
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
                    id: "nozzle_group",
                    title: "Nozzle",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "nozzle_prod",
                            title: "Production",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiZjBiNmIxZjctOTJiNy00MDE3LWIxODctYjBkNWQ0YjgxZWEzIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "b53aed22d56986701350"
                        },
                        {
                            id: "nozzle_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiZjBiNmIxZjctOTJiNy00MDE3LWIxODctYjBkNWQ0YjgxZWEzIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "7f98b7bb94720b9ec771"
                        },
                        {
                            id: "nozzle_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiZjBiNmIxZjctOTJiNy00MDE3LWIxODctYjBkNWQ0YjgxZWEzIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "2b649a4660c0bad8e84e"
                        }
                    ]
                },
                {
                    id: "injector_group",
                    title: "Injector",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "injector_prod",
                            title: "Production",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODEzMzVhZDctYTM5OC00Yjk0LWE1NmUtODA3ODlmM2MyNmM2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "323d5bb218fe3628c888"
                        },
                        {
                            id: "injector_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODEzMzVhZDctYTM5OC00Yjk0LWE1NmUtODA3ODlmM2MyNmM2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "1397f0b129e93cfb9ba3"
                        },
                        {
                            id: "injector_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODEzMzVhZDctYTM5OC00Yjk0LWE1NmUtODA3ODlmM2MyNmM2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "73b43e36ab6c7fc3aaa7"
                        },
                        {
                            id: "injector_q3",
                            title: "Quality Level 3",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODEzMzVhZDctYTM5OC00Yjk0LWE1NmUtODA3ODlmM2MyNmM2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "108d12e158c12e0c3753"
                        },
                        {
                            id: "injector_q4",
                            title: "Quality Level 4",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODEzMzVhZDctYTM5OC00Yjk0LWE1NmUtODA3ODlmM2MyNmM2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "230f84b5f1eadca4f3f5"
                        }
                    ]
                },
                {
                    id: "rail_group",
                    title: "Rail",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "rail_prod",
                            title: "Production",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDYwMjAxYTktODFiMS00Y2FjLWI1NTQtYTBjMDk3YjBkMWYxIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "af8fb4c7bff453dbbb78"
                        },
                        {
                            id: "rail_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDYwMjAxYTktODFiMS00Y2FjLWI1NTQtYTBjMDk3YjBkMWYxIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "e8806a0ffc0fd46ccda8"
                        },
                        {
                            id: "rail_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDYwMjAxYTktODFiMS00Y2FjLWI1NTQtYTBjMDk3YjBkMWYxIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "c5339ee73406c7833bad"
                        },
                        {
                            id: "rail_q3",
                            title: "Quality Level 3",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDYwMjAxYTktODFiMS00Y2FjLWI1NTQtYTBjMDk3YjBkMWYxIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "41122142a95582a72029"
                        }
                    ]
                },
                {
                    id: "filter_group",
                    title: "Filter",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "filter_prod_element",
                            title: "Production Element",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYmQ1MzE4ZDUtYjBmYS00OTk1LTlhOTgtODBiMzhjZTE0YzlmIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "802d7daef2725ac8a4c1"
                        },
                        {
                            id: "filter_prod_assembly",
                            title: "Production Assembly",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYmQ1MzE4ZDUtYjBmYS00OTk1LTlhOTgtODBiMzhjZTE0YzlmIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "0f329526bbbb4c1d70dc"
                        },
                        {
                            id: "filter_q_element",
                            title: "Quality Element",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYmQ1MzE4ZDUtYjBmYS00OTk1LTlhOTgtODBiMzhjZTE0YzlmIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "ca326cf0261b38e1d390"
                        },
                        {
                            id: "filter_q_Assy",
                            title: "Quality Assembly",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYmQ1MzE4ZDUtYjBmYS00OTk1LTlhOTgtODBiMzhjZTE0YzlmIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "17d21cf99a40bbcac00b"
                        }
                    ]
                },
                {
                    id: "dfp6_group",
                    title: "DFP6",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "dfp6_prod",
                            title: "Production",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNGNjYTg2YjktY2RkNi00YzNjLTk0NTktNzAxYjEyMzhhY2M2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "5d74c72d1294fea31b32"
                        },
                        {
                            id: "dfp6_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNGNjYTg2YjktY2RkNi00YzNjLTk0NTktNzAxYjEyMzhhY2M2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "2a02a34e61d00de6b244"
                        },
                        {
                            id: "dfp6_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNGNjYTg2YjktY2RkNi00YzNjLTk0NTktNzAxYjEyMzhhY2M2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "34972f79d06176b8b48d"
                        },
                        {
                            id: "dfp6_q3",
                            title: "Quality Level 3",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNGNjYTg2YjktY2RkNi00YzNjLTk0NTktNzAxYjEyMzhhY2M2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "2d4fdd3fe795fbf5d695"
                        }
                    ]
                },
                {
                    id: "dfp1_group",
                    title: "DFP1",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "dfp1_prod",
                            title: "Production DFP1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzE5YTEwZTUtZWYxYi00MWMwLWJhNGUtYWUwNWRiMDk5NTJlIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "dbfb50c9dabdb5401b40"
                        },
                        {
                            id: "dfp1_primer",
                            title: "Production Primer",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzE5YTEwZTUtZWYxYi00MWMwLWJhNGUtYWUwNWRiMDk5NTJlIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "f11c479d431df8e649f6"
                        },
                        {
                            id: "dfp1_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzE5YTEwZTUtZWYxYi00MWMwLWJhNGUtYWUwNWRiMDk5NTJlIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "f0acd7ea66c4c87d1b0e"
                        },
                        {
                            id: "dfp1_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzE5YTEwZTUtZWYxYi00MWMwLWJhNGUtYWUwNWRiMDk5NTJlIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "407f67793c84a48ea825"
                        }
                    ]
                },
                {
                    id: "dfp4_group",
                    title: "DFP4",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "dfp4_prod",
                            title: "Production",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDFlYTRlYmItNmU0NC00MjMzLTg1ZGYtYTRmNjYyYzNkZGE2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "d0f1414f0e3041d1ba44"
                        },
                        {
                            id: "dfp4_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDFlYTRlYmItNmU0NC00MjMzLTg1ZGYtYTRmNjYyYzNkZGE2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "b1fc41020c427b4c64c5"
                        },
                        {
                            id: "dfp4_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNDFlYTRlYmItNmU0NC00MjMzLTg1ZGYtYTRmNjYyYzNkZGE2IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "001bb24ba1ac1e96bfdf"
                        }
                    ]
                },
                {
                    id: "upcr_group",
                    title: "UPCR",
                    isGroup: true,
                    dashboards: [
                        {
                            id: "upcr_prod",
                            title: "Production",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzRlNDEyNmEtNDY1ZC00NmE2LTkzYjUtMjI5ZWMzYjNiMDA5IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "f1a96400fc2e4be59f0d"
                        },
                        {
                            id: "upcr_q1",
                            title: "Quality Level 1",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzRlNDEyNmEtNDY1ZC00NmE2LTkzYjUtMjI5ZWMzYjNiMDA5IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "97f0c596eaa37c791886"
                        },
                        {
                            id: "upcr_q2",
                            title: "Quality Level 2",
                            embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiYzRlNDEyNmEtNDY1ZC00NmE2LTkzYjUtMjI5ZWMzYjNiMDA5IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9",
                            pageName: "9e7d0a562c9e94ebcbd0"
                        }
                    ]
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
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiNWZhYjA2OTMtNmZlOC00YTU2LTg4ZDgtYTMxYWQ5Nzk3NDg5IiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
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
                    id: "SAP Data",
                    title: "SAP Data",
                    purpose: "Defect rates and quality trends",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODhmNzIxZWUtZjg5MS00ODcyLWE1MjctYzQyMDA5ZDFhZTFkIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
                },
                {
                    id: "inspection_results",
                    title: "Inspection Results",
                    purpose: "Detailed inspection data analysis",
                    embedUrl: "https://app.powerbi.com/view?r=eyJrIjoiODhmNzIxZWUtZjg5MS00ODcyLWE1MjctYzQyMDA5ZDFhZTFkIiwidCI6ImM4YTAwNDJhLTExZDctNDEzNy1iZGNlLTM2NzY3MjQ4YzA0YyJ9"
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