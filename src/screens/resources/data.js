// Resources feature specific data (migrated from root data folder)
export const RESOURCES_DATA = [
    {
        category: "Product & Finish Resources",
        items: [
            { label: "Lead Times", nav: "resources/lead-times" },
            { label: "Search Fabrics", nav: "resources/search-fabrics" },
            { label: "Request COM Yardage", nav: "resources/request-com-yardage" },
            { label: "Discontinued Finishes Database", nav: "resources/discontinued-finishes" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Dealer Tools",
        items: [
            { label: "Customers", nav: "resources/customer-directory" },
            { label: "Discounts", nav: "resources/sample-discounts" },
            { label: "Contracts", nav: "resources/contracts" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Customer Support & Field Service",
        items: [
            { label: "Loaner Pool", nav: "resources/loaner-pool" },
            { label: "Request Field Visit", nav: "resources/request-field-visit" },
            { label: "Install Instructions", nav: "resources/install-instructions" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    },
    {
        category: "Marketing & Communication",
        items: [
            { label: "Presentations", nav: "resources/presentations" },
            { label: "Social Media", nav: "resources/social-media" },
            { label: "Tradeshows", nav: "resources/tradeshows" },
        ].sort((a, b) => a.label.localeCompare(b.label))
    }
];
