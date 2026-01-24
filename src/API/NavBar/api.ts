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
            order : "4",
            visible: false,
        },
        {
            name : "Messages",
            icon: "bx bx-message-rounded nav__icon",
            dropDown: [],
            order : "3",
            visible: false,
        },
        {
            name : "Stride",
            icon: "bx bx-trending-up nav__icon",
            dropDown: [],
            order : "2",
            visible: false,
        }
    ];
    return navBarContent;
}