// Resources feature data
export const RESOURCES_DATA = [
    {
        category: "Sales Tools",
        items: [
            { label: "Sample Discounts", nav: "resources/sample-discounts" },
            { label: "Contracts", nav: "resources/contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "resources/lead-times" },
            { label: "Weight Ratings", nav: "resources/weight-ratings" },
            { label: "Search Fabrics", nav: "resources/search-fabrics" },
            { label: "Request COM Yardage", nav: "resources/request-com-yardage" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued-finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Field Support",
        items: [
            { label: "Install Instructions", nav: "resources/install-instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social-media" },
            { label: "Tradeshows", nav: "resources/tradeshows" },
            { label: "LWYD Marketplace", nav: "marketplace", sublabel: "Rewards shop" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
];
