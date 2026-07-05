# ts-abbreviation-skill

<p align="center">
  <a href="README.zh-CN.md">🇨🇳 简体中文</a> |
  <a href="README.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="https://github.com/aShu-guo/ts-abbreviation-skill/releases"><img src="https://img.shields.io/github/v/release/aShu-guo/ts-abbreviation-skill?style=for-the-badge&color=blue" alt="GitHub Release"></a>
  <a href="https://www.npmjs.com/package/ts-abbreviation-skill"><img src="https://img.shields.io/npm/v/ts-abbreviation-skill?style=for-the-badge&logo=npm&color=red" alt="npm version"></a>
  <a href="https://github.com/aShu-guo/ts-abbreviation-skill/blob/main/LICENSE"><img src="https://img.shields.io/github/license/aShu-guo/ts-abbreviation-skill?style=for-the-badge&color=green" alt="License"></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ts-abbreviation-skill"><img src="https://img.shields.io/npm/dm/ts-abbreviation-skill?style=flat-square&label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/aShu-guo/ts-abbreviation-skill/stargazers"><img src="https://img.shields.io/github/stars/aShu-guo/ts-abbreviation-skill?style=flat-square&logo=github" alt="GitHub stars"></a>
</p>

一个 Claude Code Skill，让生成/重构的 TypeScript 代码命名遵循统一的缩写词典（`business` → `biz`、`context` → `ctx`、`configuration` → `cfg` 等），而不是冗长的全称。

## 安装

```bash
npx ts-abbreviation-skill
```

安装时会询问装到哪里：

- **项目级** — `./.claude/skills/ts-abbreviation-skill/`（推荐团队共享，提交到仓库）
- **全局** — `~/.claude/skills/ts-abbreviation-skill/`（适用于你所有的项目）

两个选项可以同时勾选。重复运行安装器是安全的：目标路径下已存在的 `config/default.config.json` 和 `dictionary/default.json` 不会被覆盖。

## 效果

- **生成新代码时**：Claude 在命名局部变量/参数之前查缩写词典，有匹配则使用缩写形式。
- **重构已有代码时**：批量改名强制走基于 AST 的重命名脚本（`ts-morph`），不允许纯文本替换，避免误改字符串字面量和跨作用域同名变量。改名后必须跑 `tsc --noEmit` 校验，不通过不算完成。

完整规则见 [`skill/SKILL.md`](skill/SKILL.md)。

## 内置词典摘录

| 全称 | 缩写 |
|------|------|
| business | biz |
| context | ctx |
| configuration / config | cfg |
| parameter / parameters | param / params |
| response | res |
| request | req |
| temporary | tmp |
| reference | ref |
| element | el |
| repository | repo |
| service | svc |
| database | db |
| application | app |
| ... | ... |

完整词典见 [`skill/dictionary/default.json`](skill/dictionary/default.json)。

## 自定义

**调整生效范围** — 修改安装目录里的 `config/default.config.json`：

```json
{ "scope": ["variable", "parameter"], "exported": false }
```

`scope` 可选值：`variable`、`parameter`、`localFunction`、`class`。`exported` 控制是否对导出/公共符号生效（默认 `false`）。

**添加项目专属缩写** — 在仓库根目录放 `.claude/ts-abbreviation.local.json`，词条会合并覆盖默认词典：

```json
{
  "warehouse": "wh",
  "department": "dept"
}
```

## 本地开发

```bash
npm install
npm run build        # 构建 src/cli.ts -> dist/cli.js
node dist/cli.js     # 本地测试安装器
```

迭代调试 Skill 内容时，用 symlink 代替每次重新构建：

```bash
ln -sfn /path/to/ts-abbreviation-skill/skill \
  your-test-project/.claude/skills/ts-abbreviation-skill
```

## License

MIT
