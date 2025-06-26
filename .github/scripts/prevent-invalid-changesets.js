const fs = require("fs");

module.exports = async ({ core, exec }) => {
  try {
    await exec.exec("git", [
      "fetch",
      "https://github.com/bigcommerce/catalyst.git",
      "integrations/makeswift",
    ]);

    const { stdout } = await exec.getExecOutput("git", [
      "diff",
      "--name-only",
      `origin/integrations/makeswift...HEAD`,
    ]);

    const allFilenames = stdout.split("\n").filter((line) => line.trim());
    const changesetFilenames = allFilenames.filter(
      (file) => file.startsWith(".changeset/") && file.endsWith(".md")
    );

    if (changesetFilenames.length === 0) {
      core.info("No changeset files found to validate");
      return;
    }

    core.info(`Found ${changesetFilenames.length} changeset files to validate`);

    for (const filename of changesetFilenames) {
      core.info(`Checking ${filename}...`);

      // .changeset/*.md filenames should only contain alphanumeric characters, hyphens, and underscores
      if (!/^\.changeset\/[a-zA-Z0-9_-]+\.md$/.test(filename)) {
        core.setFailed(`Invalid filename pattern: ${filename}`);
        return;
      }

      // extra defense against path traversal attacks
      if (
        filename.includes("..") ||
        (filename.includes("/") && !filename.startsWith(".changeset/"))
      ) {
        core.setFailed(`Suspicious file path: ${filename}`);
        return;
      }

      if (!fs.existsSync(filename)) {
        core.setFailed(`File not found: ${filename}`);
        return;
      }

      // check file size (limit to 100KB)
      const stats = fs.statSync(filename);
      if (stats.size > 102400) {
        core.error(`File too large`, { file: filename });
        core.setFailed(`File ${filename} is too large`);
        return;
      }

      if (stats.isSymbolicLink()) {
        core.error(`Symlinks are not allowed`, { file: filename });
        core.setFailed(`File ${filename} is a symlink`);
        return;
      }

      const content = fs.readFileSync(filename, "utf8");

      // starts with "---", captures everything until the next "---"
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) {
        core.error(`Failed to extract frontmatter or file has no frontmatter`, {
          file: filename,
        });
        core.setFailed(`File ${filename} has invalid or missing frontmatter`);
        return;
      }

      const frontmatter = frontmatterMatch[1];

      // extract all packages starting with "@bigcommerce/
      const packageMatches = frontmatter.match(/"@bigcommerce\/[^"]+"/g);

      if (packageMatches) {
        const invalidPackages = packageMatches.filter(
          (pkg) => pkg !== '"@bigcommerce/catalyst-makeswift"'
        );

        if (invalidPackages.length > 0) {
          core.error(
            `Invalid package found in changeset file. Only @bigcommerce/catalyst-makeswift is allowed.`,
            { file: filename }
          );
          core.setFailed(
            `File ${filename} contains invalid packages: ${invalidPackages.join(
              ", "
            )}`
          );
          return;
        }
      }
    }

    core.info("All changeset files validated successfully");
  } catch (error) {
    core.setFailed(`Validation failed: ${error.message}`);
  }
};
