const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

fs.mkdirSync('dist', { recursive: true });

if (!fs.existsSync(`dist/main.css`)) {
  axios.get('https://www.drishtiias.com/drishti/css/main.css').then(response => {
    fs.writeFileSync('dist/main.css', response.data);
  });
}

let baseUrl = 'https://www.drishtiias.com/current-affairs-news-analysis-editorials';
//let path = '/news-analysis/05-07-2021/print';

["news-analysis", "news-editorials"].forEach(folder => {
  donwloadHtml(folder, '2021-07-06');
});

function donwloadHtml(folder, date = new Date()) {
  let dt = new Date(date);
  dt.setTime(dt.getTime() + 5.5 * 3600 * 1000);
  dt = dt.toJSON().split('T')[0];

  axios.get(`${baseUrl}/${folder}/${dt}/print`)
    .then((resp) => {
      console.log(resp.request.path);
      let dt = resp.request.path.split('/')[3].split('-').join('/');
      let $ = cheerio.load(resp.data);
      $('.article-detail').each((i, e) => {
        let style = `<link rel="stylesheet" href="../../../../../main.css">`;
        let html = `
      <section class="article-list">
        <div class="wrapper">
          <div class="list-category">
            <article>
              <div class="article-detail">
                ${$(e).html()}
              </div>
            </article>
          </div>
        </div>
      </section>`;
        let dirPath = `dist/${folder}/${dt}/${i >= 9 ? i + 1 : '0' + (i + 1)}`;
        fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(
          `${dirPath}/index.html`,
          (style + html).replace(/\>\s+\</g, '><')
        );
      });
    });
}