import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

export default class HomeController {
  static home(req, res) {
    const { pageName } = req.params;
    function getProjectRoot() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'html', 'View'))) return cwd;

  if (fs.existsSync(path.join(cwd, 'View')) && fs.existsSync(path.join(cwd, 'Controller'))) {
    return path.resolve(cwd, '..');
  }

  return cwd;
}

const rootDir = getProjectRoot();


    const headerPath = path.join(rootDir, 'html', 'View', 'header.html');
    const footerPath = path.join(rootDir, 'html', 'View', 'footer.html');
    const fileDataPath = path.join(
      rootDir,
      'html',
      'View',
      pageName,
      `${pageName}.html`
    );

    fs.readFile(headerPath, 'utf8', (err, header) => {
      if (err) {
        console.log('headerPath load error:', headerPath);
        return res.status(500).send('server error');
      }

      fs.readFile(footerPath, 'utf8', (err, footer) => {
        if (err) {
          return res.status(500).send('server error');
        }

        fs.readFile(fileDataPath, 'utf8', (err, fileData) => {
          if (err) {
            // 頁面不存在 → 只顯示 header + footer
            return res.send(header + footer);
          }

          return res.send(header + fileData + footer);
        });
      });
    });
  }
}
