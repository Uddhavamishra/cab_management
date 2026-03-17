import fs from 'fs';
import https from 'https';

const screens = {
  'cabs_routes': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFkM2YzZTFiZGIyZDRkMTViNGQ2NDJhYjU1MjhlOTlmEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'shifts': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzM3NThmY2YyNDVhMDRlMzNiOThiMmFiMDM4MGI5MjJmEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'attendance': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzNiMDBlZDIyYTNiMzQzNjM4NjNlZWMyYTdkNzhkNjdlEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'offices': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc0MGE4NWYwZmI3MDQ2MmFhMzhlMmE4NTA2YzBmYjRiEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'users': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzFlOGU0ZmMxNzNiMDRkMzM4M2MxMDgwMjg5NTliMWI3EgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'dashboard': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdjOTYxNWY1MmEyMzQ1YzU4ODdlZjAwNjdlYWZiMTMyEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'login': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzYzZmIyN2QxMDlmMDRjODNhNTQyMmUxYmM5YzYwM2ZjEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086',
  'address_approvals': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzIzZTJiYTY5Zjk4YjQzY2Q5NGRjYWJkNjJhNDMzMWJlEgsSBxDLx9nk5AgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTkwMjkzMTU5NzMxOTUzNzYwOQ&filename=&opi=89354086'
};

const dir = './client/stitch_screens';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

Object.entries(screens).forEach(([name, url]) => {
  https.get(url, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      fs.writeFileSync(`${dir}/${name}.html`, rawData);
      console.log(`Saved ${name}.html`);
    });
  }).on('error', (e) => {
    console.error(`Got error for ${name}: ${e.message}`);
  });
});
