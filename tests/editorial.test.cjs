require('./catalog.test.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {projects,hasCategory}=require('../lib/projects.ts');
const {defaultCollections,collectionProjects}=require('../lib/collections.ts');
const {defaultProfile,defaultJournal,defaultTestimonials}=require('../lib/studio-content.ts');
const {upgradeCatalog,CATALOG_VERSION}=require('../lib/catalog-upgrade.ts');
const {validateContent}=require('../lib/content-validation.ts');
const {publicContent}=require('../lib/editorial-validation.ts');
const {siteConfig}=require('../lib/site-config.ts');
const oldProjects=require('../lib/catalog-v2.json');
const crops=require('../lib/image-crops.json');
const legacy={catalogVersion:2,projects:structuredClone(oldProjects),settings:structuredClone(siteConfig),crops};
legacy.settings.homepage.projectOrder=oldProjects.map(p=>p.slug);
const migrated=upgradeCatalog(legacy);
assert.equal(migrated.catalogVersion,CATALOG_VERSION);
assert.equal(migrated.projects.filter(p=>hasCategory(p,'Restoration')).length,5);
assert.equal(migrated.projects.filter(p=>hasCategory(p,'Outdoor Systems')).length,15);
assert.equal(migrated.projects.filter(p=>hasCategory(p,'Product & Technical')).length,2);
assert.deepEqual(migrated.settings.homepage.projectOrder,siteConfig.homepage.projectOrder);
const validated=validateContent(migrated);
for(const collection of validated.collections){
 const matching=collectionProjects(validated.projects,collection);
 assert.ok(matching.length>0,collection.slug);
 assert.equal(matching[0].slug,collection.featuredProject,collection.slug);
 assert.equal(new Set(matching.map(p=>p.slug)).size,matching.length);
 const rest=matching.filter(p=>p.slug!==collection.featuredProject);
 assert.deepEqual(rest,validated.projects.filter(p=>hasCategory(p,collection.category)&&p.slug!==collection.featuredProject));
}
for(const post of validated.journal)assert.ok(fs.existsSync('public'+post.image));
assert.ok(fs.existsSync('public'+validated.profile.portrait));
const owner=structuredClone(legacy);
owner.projects=owner.projects.filter(p=>!['komfor-residences','marina-village'].includes(p.slug));
owner.projects.find(p=>p.slug==='portobello').description='Owner-written pergola description.';
owner.projects.find(p=>p.slug==='portobello').categories=['Exterior'];
owner.settings.homepage.projectOrder=['portobello','skyline-residences'];
const ownerUpgraded=upgradeCatalog(owner);
assert.equal(ownerUpgraded.projects.find(p=>p.slug==='portobello').description,'Owner-written pergola description.');
assert.deepEqual(ownerUpgraded.projects.find(p=>p.slug==='portobello').categories,['Exterior']);
assert.deepEqual(ownerUpgraded.settings.homepage.projectOrder,owner.settings.homepage.projectOrder);
assert.equal(ownerUpgraded.collections.find(c=>c.slug==='restoration').featuredProject,'');
assert.equal(ownerUpgraded.journal[0].projectSlug,'');
assert.ok(!ownerUpgraded.projects.some(p=>p.slug==='komfor-residences'));
validateContent(ownerUpgraded);
const edited=structuredClone(validated);edited.profile.biography='Owner biography.';edited.journal[0].body='Private draft text';edited.journal[0].published=false;edited.testimonials[0].published=false;edited.collections[0].featuredProject='garden-residences';
assert.deepEqual(upgradeCatalog(edited),edited);
const safe=publicContent(edited);
assert.ok(!safe.journal.some(p=>p.body==='Private draft text'));
assert.ok(!safe.testimonials.some(r=>r.id===edited.testimonials[0].id));
assert.equal(edited.journal.length,3);
const sample=validateContent(edited).testimonials.find(r=>r.sample);
assert.ok(sample&&sample.sample===true);
for(const mutate of [
 d=>d.collections[0].featuredProject='louver-mechanism',
 d=>d.journal.push(structuredClone(d.journal[0])),
 d=>d.journal[0].date='2026-02-30',
 d=>d.journal[0].image='https://example.com/image.jpg',
 d=>d.journal[0].projectSlug='missing-project',
 d=>d.profile.linkedin='javascript:alert(1)',
 d=>d.testimonials[0].sample='false',
 d=>d.projects[0].topics=['Unsupported'],
]){const bad=structuredClone(validated);mutate(bad);assert.throws(()=>validateContent(bad));}
console.log('PASS: category coverage, featured-first ordering, subtype filters, v2 migration, owner edits/deletions, draft privacy, sample labels, and editorial validation.');
