global.opt = {
    1: '0000',
    2: '000',
    3: '00', 
    4: '0',
    5: '',
    i: null,
    length: null,
    ext_file: '.mp4',
    url: 'https://www.youtube.com/watch?v=',
    target: 'file with html text dom page, example: https://www.youtube.com/channel/(id channel)/videos',
    full_time: 0,
    full_size: 0
};

var dat = cheerio.load(
    fs.readFileSync(
        path.join(
            __dirEntry,
            opt.target
        ), 'utf8'))('#items')
        .html()
        .match(/\?v=[a-zA-Z0-9-_]{11}\">\n/g).join().match(/[a-zA-Z0-9-_]{11}/g);

opt.i = opt.length = dat.length;

const normaliseSize = function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};





global.requestToYoutybe;

function dawn(data_array) {
    var url = opt.url + data_array.shift(),
        file_length = 0,
        data_length = 0;

    ytdl.validateURL(url) &&
    ytdl.getInfo(url,
        function (err, info, i) {
            if (err) {
                opt.i--;
                dawn(data_array);
                return console.log(err);
            }
            
            while (i = info.formats.shift()) {
                if ((!!i.resolution && !i.audioBitrate)) continue;
                break;
            }

            requestToYoutybe = request.get(i.url);

            requestToYoutybe.on('response', function(response) {
                if(response.statusCode !== 200)console.log('! ! ! Response: ' + response.statusCode)
                
                opt.full_size += parseFloat(file_length = response.headers['content-length']);
                
                file = path.join(__dirEntry, 
                            info.author.name,
                            opt[opt.i.toString().length] + opt.i +
                            moment(info.published).format('.YYYY:MM:DD.') +
                            info.video_id + '.' +
                            (info.title)
                            .replace(/\//g, '_')
                            .replace(/\\/g, '_')
                            .replace(/\s*$/, '')
                            .replace(/\.*$/, '') + opt.ext_file);

                    mkdirp(path.dirname(file));

                    console.log('-----  -----  -----  -----  -----  -----  -----');
                    
                    console.log(
                        opt[opt.i.toString().length] +
                        opt.i + ' ' +
                        info.video_id +
                        ' - 🎬 ' + i.resolution +
                        ' 🎧 ' + i.audioBitrate + ' Размер: ' +
                        file_length + ' = ' + normaliseSize(file_length) +
                        '\nАвтор: ' + info.author.name + '\n' +
                        info.title
                    );
                    opt.i--;
                    requestToYoutybe.pipe(fs.createWriteStream(file));

            }).on('data', function(data) {

                data_length += data.length;

                process.stdout.write('\t' + 
                    (data_length / file_length * 100)
                    .toFixed(2) + ' %' + '\033[0G');

            }).on('error', function(err) {
                console.log('Ошибка на файле: ' + opt.i);
                opt.i--;
                console.log(err);
                dawn(data_array);
            }).on('end', function() {
                opt.full_time += parseFloat(info.length_seconds);
                
                if(data_array.length) {
                    dawn(data_array);
                }else{
                    console.log(
                        'Is Finish'+
                        '\nTotal download items: ' + opt.length +
                        '\nTotal files size: ' + normaliseSize(opt.full_size) +
                        '\nTotal duration time : ' + (opt.full_time / 60 / 60) + ' часов'
                        )
                }
            })
        });
}

dawn(dat);
