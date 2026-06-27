export function getNavBarContent () {
    const url = '/evolyn/api/navbar'
    const navBarContent = [
        {
            name : "Home",
            icon : "bx bx-home nav__icon",
            dropDown : [],
            order : "1",
            visible: false,
        },
        {
            name : "Explore",
            icon: "bx bx-compass nav__icon",
            dropDown: [],
            order : "5",
            visible: false,
        },
        {
            name : "Messages",
            icon: "bx bx-message-rounded nav__icon",
            dropDown: [],
            order : "4",
            visible: false,
        },
        {
            name : "Stride",
            icon: "bx bx-trending-up nav__icon",
            dropDown: [],
            order : "2",
            visible: false,
        },
        {
            name : "Expenses",
            icon: "bx bx-receipt",
            dropDown: [
                {
                    id: "1",
                    label : "Transactions",
                    icon: "bx bx-transfer-alt",
                },
                {
                    id: "2",
                    label : "Categories",
                    icon: "bx bx-purchase-tag-alt",
                },
                {
                    id: "3",
                    label : "Budgets",
                    icon: "bx bx-wallet",
                },
                {
                    id: "4",
                    label: "Recurring",
                    icon: "bx bx-refresh",
                },
                {
                    label: "Reports",
                    id: "5",
                    icon: "bx bx-bar-chart-alt-2",
                },
                {
                    label: "Insights",
                    id: "6",
                    icon: "bx bx-bulb",
                },
                {
                    label: "Accounts",
                    id: "7",
                    icon: "bx bx-credit-card",
                },
            ],
            order : "3",
            visible: false,
        }
    ];
    return navBarContent;
}