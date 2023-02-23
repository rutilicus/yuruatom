import React from "react"
import { createRoot } from "react-dom/client"
import { parse } from "csv-parse/sync"
import { Feed, Entry, isFeed, isEntry } from "./types";

interface AppProps {

}
interface AppState {
  isFeedUploaded?: boolean;
  isEntryUploaded?: boolean;
}

class App extends React.Component<AppProps, AppState> {
  feedData = {
    author: "",
    title: "",
    url: ""
  } as Feed;
  entryData = [] as Entry[];

constructor(props) {
    super(props);

    this.importFeedCsv = this.importFeedCsv.bind(this);
    this.importEntryCsv = this.importEntryCsv.bind(this);
    this.generateFeed = this.generateFeed.bind(this);
    this.escapeCharacter = this.escapeCharacter.bind(this);

    this.state = {
      isFeedUploaded: false,
      isEntryUploaded: false
    };
  }

  importFeedCsv(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files.length != 0) {
      const file = e.target.files[0];
      const render = new FileReader();
      render.onload = () => {
        if (typeof render.result === "string") {
          const records = parse(render.result, {columns: true, skip_empty_lines: true}) as any[];
          if (records.length > 0 && isFeed(records[0])) {
            this.feedData = records[0];
            this.setState({isFeedUploaded: true});
          }
        }
      };
      render.readAsText(file);
    }
  }

  importEntryCsv(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files.length != 0) {
      const file = e.target.files[0];
      const render = new FileReader();
      render.onload = () => {
        if (typeof render.result === "string") {
          const records = parse(render.result, {columns: true, skip_empty_lines: true}) as any[];
          if (records.length > 0 && isEntry(records[0])) {
            this.entryData = records;
            this.setState({isEntryUploaded: true});
          }
        }
      };
      render.readAsText(file);
    }
  }

  escapeCharacter(str: string): string {
    const regamp = /&/g;
    const regquot = /"/g;
    const regapos = /'/g;
    const reglt = /</g;
    const reggt = />/g;
    return str.replace(regamp, "&amp;").replace(regquot, "&quot;").replace(regapos, "&apos;").replace(reglt, "&lt;").replace(reggt, "&gt;");
  }

  generateFeed() {
    let latestDate = "";
    for (let i = 0; i < this.entryData.length; i++) {
      if (this.entryData[i].updated > latestDate) {
        latestDate = this.entryData[i].updated;
      }
    }

    let outStr = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
    outStr += "<feed xmlns=\"http://www.w3.org/2005/Atom\">";
    outStr += "<author><name>" + this.feedData.author + "</name></author>";
    outStr += "<id>" + this.feedData.url + "</id>";
    outStr += "<link href=\"" + this.feedData.url + "\"/>";
    outStr += "<title>" + this.feedData.title + "</title>";
    outStr += "<updated>" + latestDate + "+09:00" + "</updated>";
    for (let i = 0; i < this.entryData.length; i++) {
      outStr += "<entry>";
      outStr += "<id>" + this.entryData[i].url + "</id>";
      outStr += "<link href=\"" + this.entryData[i].url + "\"/>";
      outStr += "<title>" + this.entryData[i].title + "</title>";
      outStr += "<updated>" + this.entryData[i].updated + "+09:00" + "</updated>";
      outStr += "<summary type=\"" + (this.entryData[i].summaryType === "html" ? "html" : "text") + "\">" + this.escapeCharacter(this.entryData[i].summary) + "</summary>";
      outStr += "</entry>"
    }
    outStr += "</feed>";

    const blob = new Blob([outStr], {type: "application/atom+xml"});
    const dummyElem = document.createElement("a");
    document.body.appendChild(dummyElem);
    dummyElem.href = window.URL.createObjectURL(blob);
    dummyElem.download = "feed.atom";
    dummyElem.click();
    document.body.removeChild(dummyElem);
  }

  render(): React.ReactNode {
    return (
      <div>
        <ol>
          <li>
            <a href="./feed.csv">feed</a>と<a href="./entry.csv">entry</a>の2酒類のテンプレートをダウンロードしてください。
          </li>
          <li>
            内容を編集してそれぞれアップロードしてください。<br />
            <label htmlFor="feed_upload">feed.csv</label><br />
            <input type="file" id="feed_upload" name="feed_upload" accept=".csv" onChange={this.importFeedCsv} /><br />
            <label htmlFor="entry_upload">entry.csv</label><br />
            <input type="file" id="entry_upload" name="entry_upload" accept=".csv" onChange={this.importEntryCsv} />
          </li>
          <li>
            Generateボタンを押してAtomフィードを作成してください。<br />
            <button name="generate_button" disabled={!this.state.isFeedUploaded || !this.state.isEntryUploaded} onClick={this.generateFeed}>Generate</button>
          </li>
          <li>
            サーバが対応している場合、サーバ上にfeed.atomを配置してリンクを作成すればAtomフィードを作成できます。対応していない場合は作成できません。
          </li>
        </ol>
      </div>
    );
  }
}

createRoot(document.getElementById("wrapper")!).render(<App />);
