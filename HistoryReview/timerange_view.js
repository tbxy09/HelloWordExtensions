// TimelineView is a view that displays a timerange of events.

function TimeRangesComponent(visits) {
    // Initialize the Timeline component
    this.initializeTimeline(visits);
}

TimeRangesComponent.prototype.initializeTimeline = function (visits) {
    const timelineContainer = document.getElementById('timelineContainer');
    const items = visits.map(function (visit) {
        return {
            id: visit.visitId,
            content: visit.title,
            start: new Date(visit.visitTime),
            group: visit.url
        };
    });

    const options = {
        editable: false,
        selectable: true,
        zoomable: true,
        stack: false,
        orientation: 'top',
        timeAxis: { scale: 'day', step: 1 },
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default start date (7 days ago)
        end: new Date() // Default end date (today)
    };

    this.timeline = new dashjs.Timeline(timelineContainer, items, options);

    // Handle range selector change event
    this.timeline.on('rangechanged', function (event) {
        const startTime = event.start.getTime();
        const endTime = event.end.getTime();
        fetchVisitsByTimeRange(startTime, endTime);
    });
};

export default TimeRangesComponent;