import { describe, it, expect } from "vitest";
import { collectResourceFilePaths, deleteNodeAndStorage } from "@/lib/admin/storage-cleanup";

describe("collectResourceFilePaths", () => {
  it("gathers paths from a course's full tree", () => {
    const course = {
      subjects: [
        {
          chapters: [
            { resources: [{ file_path: "a" }, { file_path: "b" }] },
            { resources: [{ file_path: "c" }] },
          ],
        },
        { chapters: [{ resources: [{ file_path: "d" }] }] },
      ],
    };
    expect(collectResourceFilePaths("course", course)).toEqual(["a", "b", "c", "d"]);
  });

  it("gathers paths from a subject's chapters", () => {
    const subject = { chapters: [{ resources: [{ file_path: "x" }] }, { resources: [{ file_path: "y" }] }] };
    expect(collectResourceFilePaths("subject", subject)).toEqual(["x", "y"]);
  });

  it("gathers paths from a chapter's resources", () => {
    const chapter = { resources: [{ file_path: "p" }, { file_path: "q" }] };
    expect(collectResourceFilePaths("chapter", chapter)).toEqual(["p", "q"]);
  });

  it("skips link resources (null file_path) and empty strings", () => {
    const chapter = { resources: [{ file_path: "keep" }, { file_path: null }, { file_path: "" }] };
    expect(collectResourceFilePaths("chapter", chapter)).toEqual(["keep"]);
  });

  it("tolerates missing/empty nested arrays", () => {
    expect(collectResourceFilePaths("course", { subjects: null })).toEqual([]);
    expect(collectResourceFilePaths("subject", { chapters: null })).toEqual([]);
    expect(collectResourceFilePaths("chapter", { resources: null })).toEqual([]);
    expect(collectResourceFilePaths("course", { subjects: [{ chapters: [{ resources: null }] }] })).toEqual([]);
  });
});

/** Fake Supabase client recording the delete + storage.remove calls. */
function fakeClient(selectData: unknown) {
  const removed: string[][] = [];
  let deleted = false;
  let deletedBeforeSelect = false;

  const tableBuilder = {
    select: () => tableBuilder,
    delete: () => {
      // delete must happen after we've read the tree
      deletedBeforeSelect = selectData === undefined;
      deleted = true;
      return tableBuilder;
    },
    eq: () => tableBuilder,
    single: async () => ({ data: selectData, error: null }),
    // awaiting the delete chain resolves here
    then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
  };

  const client = {
    from: () => tableBuilder,
    storage: {
      from: () => ({
        remove: async (paths: string[]) => {
          removed.push(paths);
          return { error: null };
        },
      }),
    },
  };

  return { client: client as never, removed, wasDeleted: () => deleted, deletedBeforeSelect: () => deletedBeforeSelect };
}

describe("deleteNodeAndStorage", () => {
  it("deletes the row and removes all descendant files", async () => {
    const tree = { subjects: [{ chapters: [{ resources: [{ file_path: "a" }, { file_path: "b" }] }] }] };
    const fake = fakeClient(tree);

    await deleteNodeAndStorage(fake.client, "course", "course-1");

    expect(fake.wasDeleted()).toBe(true);
    expect(fake.removed).toEqual([["a", "b"]]);
  });

  it("does not call storage.remove when there are no files", async () => {
    const fake = fakeClient({ resources: [{ file_path: null }] });

    await deleteNodeAndStorage(fake.client, "chapter", "chapter-1");

    expect(fake.wasDeleted()).toBe(true);
    expect(fake.removed).toEqual([]);
  });

  it("batches removal in chunks of 100", async () => {
    const resources = Array.from({ length: 250 }, (_, i) => ({ file_path: `f${i}` }));
    const fake = fakeClient({ resources });

    await deleteNodeAndStorage(fake.client, "chapter", "chapter-1");

    expect(fake.removed.map((b) => b.length)).toEqual([100, 100, 50]);
  });
});
