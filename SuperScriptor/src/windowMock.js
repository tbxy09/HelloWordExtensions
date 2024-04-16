module.exports = {
    // mock global properties needed
    window: {
        location: {
            href: '',
        },
        localStorage: {
            getItem: () => { },
            setItem: () => { },
        },
    },
};