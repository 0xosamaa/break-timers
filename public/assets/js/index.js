const timeDiv = $('#current-time');
const countdownComponent = $('#countdown h1');
let total_seconds = 60 * 60 * 1;

setInterval(() => {
    const time = parseInt($('#time-left').text());
    $('#time-left').css(
        'color',
        `rgb(${255 - 4.25 * time}, ${4.25 * time}, 255)`
    );
}, 1 * 1000);
setInterval(() => {
    const current_time = new Date().toLocaleString();
    timeDiv.text(current_time);
}, 1 * 1000);

$.ajax({
    url: '/timers',
    type: 'GET',
    success: function (data) {
        $('#time-left').text(
            `${parseInt((60 * 60 - data.seconds_used) / 60)} mins`
        );
    },
});

$.ajax({
    url: '/timer',
    type: 'GET',
    success: function () {
        $('.controls').css('display', 'none');
        $('.end #end-break').css('display', 'block');
        const timerInterval = setInterval(() => {
            $.ajax({
                url: '/timer',
                type: 'GET',
                success: function (data) {
                    const { hours, minutes, seconds } = timer(
                        data.current_seconds
                    );
                    countdownComponent.text(
                        `${hours < 10 ? '0' : ''}${hours}:${
                            minutes < 10 ? '0' : ''
                        }${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
                    );
                    if (data.current_seconds == 60) {
                        // play audio
                        $('audio#almost')[0].loop = true;
                        $('audio#almost')[0].play();
                        $('#mute').css('display', 'block');
                    }
                    if (data.current_seconds <= 1 || !data.isActive) {
                        setTimeout(() => {
                            $('audio#done')[0].loop = true;
                            $('audio#done')[0].play();
                            $('#mute').css('display', 'block');
                            $('.controls').css('display', 'flex');
                            countdownComponent.text('00:00:00');
                            clearInterval(timerInterval);
                        }, 1000);
                    }
                },
                error: function (err) {
                    $('.error').text(err.responseJSON.error);
                    setTimeout(() => {
                        $('.error').css('display', 'none');
                    }, 5 * 1000);
                    countdownComponent.text('00:00:00');
                    clearInterval(timerInterval);
                },
            });
        }, 1 * 1000);
    },
});

const startTimer = (total_seconds) => {
    $.ajax({
        url: '/timer',
        type: 'POST',
        data: {
            total_seconds,
        },
        success: function (data) {
            $('.end #end-break').css('display', 'block');

            const timerInterval = setInterval(() => {
                $.ajax({
                    url: '/timer',
                    type: 'GET',
                    success: function (data) {
                        const { hours, minutes, seconds } = timer(
                            data.current_seconds
                        );
                        countdownComponent.text(
                            `${hours < 10 ? '0' : ''}${hours}:${
                                minutes < 10 ? '0' : ''
                            }${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
                        );
                        if (data.current_seconds == 60) {
                            // play audio
                            $('audio#almost')[0].loop = true;
                            $('audio#almost')[0].play();
                            $('#mute').css('display', 'block');
                            // $('audio#almost')[0].pause()
                        }
                        if (data.current_seconds <= 1 || !data.isActive) {
                            setTimeout(() => {
                                $('audio#done')[0].loop = true;
                                $('audio#done')[0].play();
                                $('#mute').css('display', 'block');
                                $('.controls').css('display', 'flex');
                                $('.end #end-break').css('display', 'none');
                                countdownComponent.text('00:00:00');
                                clearInterval(timerInterval);
                            }, 1000);
                        }
                    },
                    error: function (err) {
                        $('.error').text(err.responseJSON.error);
                        setTimeout(() => {
                            $('.error').css('display', 'none');
                        }, 5 * 1000);
                        countdownComponent.text('00:00:00');
                        clearInterval(timerInterval);
                    },
                });

                $.ajax({
                    url: '/timers',
                    type: 'GET',
                    success: function (data) {
                        $('#time-left').text(
                            `${parseInt(
                                (60 * 60 - data.seconds_used) / 60
                            )} mins`
                        );
                    },
                    error: function () {
                        clearInterval(timerInterval);
                    },
                });
            }, 1 * 1000);
        },
        error: function (err) {
            $('.error').text(err.responseJSON.error);
            $('.error').css('display', 'block');
            setTimeout(() => {
                $('.error').css('display', 'none');
            }, 5 * 1000);
            $('.controls').css('display', 'flex');
        },
    });
};
const endTimer = () => {
    $.ajax({
        url: '/timer',
        type: 'DELETE',
        success: function (data) {
            $('.controls').css('display', 'flex');
            $('audio#almost')[0].pause();
            $('audio#done')[0].currentTime = 0;
            $('audio#done')[0].pause();
            $('audio#almost')[0].currentTime = 0;
            $('#mute').css('display', 'none');
        },
        error: function (err) {
            $('.error').text(err.responseJSON.error);
            $('.error').css('display', 'block');
            setTimeout(() => {
                $('.error').css('display', 'none');
            }, 5 * 1000);
        },
    });
};

function timer(total_seconds) {
    let seconds = total_seconds % 60;
    let minutes = parseInt((total_seconds / 60) % 60);
    let hours = parseInt(total_seconds / (60 * 60));

    return { hours, minutes, seconds };
}

$('#mins-15').on('click', () => {
    startTimer(15 * 60);
    $('.controls').css('display', 'none');
});
$('#mins-30').on('click', () => {
    startTimer(30 * 60);
    $('.controls').css('display', 'none');
});
$('#all-left').on('click', () => {
    startTimer(0);
    $('.controls').css('display', 'none');
});
$('#submit').on('click', (e) => {
    e.preventDefault();
    const total_seconds = +$('#custom').val() * 60;
    $('#custom').val('');
    startTimer(total_seconds);
    $('.controls').css('display', 'none');
});
$('#end-break').on('click', () => {
    $('.end #end-break').css('display', 'none');
    endTimer();
});
$('#mute').on('click', function () {
    $('audio#almost')[0].pause();
    $('audio#done')[0].currentTime = 0;
    $('audio#done')[0].pause();
    $('audio#almost')[0].currentTime = 0;
    $(this).css('display', 'none');
});
