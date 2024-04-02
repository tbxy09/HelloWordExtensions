class TimeLineView {
    constructor(containerid) {
        this.containerid = containerid
    }
    render(visits) {
        // move displayTimelineHistory(visits) here
        // Initialize the Timeline component
        const historyContainer = document.getElementById(this.containerid);
        visits.reverse().forEach(visit => {
            const listItem = document.createElement('li');
            // remote the bullet point from the list
            listItem.style.listStyle = 'none';
            listItem.style.marginBottom = '10px';
            const link = document.createElement('a');
            link.href = visit.url;
            link.textContent = visit.title;
            link.addEventListener('click', function (event) {
                event.preventDefault();
                focusOrCreateTab(visit.url);
            });
            // Add a color marker for open tabs
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(function (tab) {
                    if (tab.url === visit.url) {
                        // link.style.color = 'green';
                        // add the status check if the link element already has AdjacentHTML to indicate the link is already open, no need to add the svg again
                        if (link.getAttribute('data-status') !== 'open') {
                            link.insertAdjacentHTML('afterbegin', `
              <svg height="20" width="10">
                <line x1="5" y1="0" x2="5" y2="20" style="stroke:rgb(255,0,0);stroke-width:2" />
              </svg>
            `);
                            // add a status to indicate the link element already has AdjacentHTML
                            link.setAttribute('data-status', 'open');
                        }
                    } else {
                        link.style.color = 'gray';
                    }
                });
            })
            // if visit is label as highlit, add a highlight background color
            if (visit.highlight) {
                listItem.style.backgroundColor = 'yellow';
            } else {
                // listItem.style.backgroundColor = 'white';
                // change other item to a color to make the highlight item more visible
                listItem.style.backgroundColor = '#f0f0f0';
            }
            listItem.appendChild(link);
            listItem.appendChild(document.createTextNode(` - ${new Date(visit.visitTime).toLocaleString()}`));
            historyContainer.appendChild(listItem);
        });

    }
}
function timelineView(containerid) {
    return new TimeLineView(containerid)
}