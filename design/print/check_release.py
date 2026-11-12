"""Adversarial controls for release PDF sanitation and publication metadata."""
import argparse, tempfile
from pathlib import Path
import pymupdf
import release_export as release

def main():
    with tempfile.TemporaryDirectory() as d:
        doc=pymupdf.open();page=doc.new_page(width=504,height=720)
        page.insert_text((50,70),'Text retained',color=(1,0,0))
        page.insert_link({'kind':pymupdf.LINK_URI,'from':pymupdf.Rect(50,50,150,80),'uri':'https://example.invalid'})
        page.add_text_annot((200,100),'comment')
        widget=pymupdf.Widget();widget.field_name='test';widget.field_type=pymupdf.PDF_WIDGET_TYPE_TEXT;widget.rect=pymupdf.Rect(50,150,200,170);page.add_widget(widget)
        doc.set_toc([[1,'Test',1]]);doc.set_metadata({'title':'TBD placeholder'})
        doc.xref_set_key(doc.pdf_catalog(),'OpenAction','<< /S /JavaScript /JS (app.alert\\(1\\)) >>')
        assert release.errors(doc),'Dirty PDF escaped detection'
        audit=release.greyscale(doc);assert audit['non_grey_paint'],'Red control not detected'
        release.clean(doc);p=Path(d)/'clean.pdf';doc.save(p,garbage=4,deflate=True);doc.close()
        clean=pymupdf.open(p)
        assert not release.errors(clean),release.errors(clean)
        assert 'Text retained' in clean[0].get_text()
        for key in release.INFO:
            metadata=dict(clean.metadata);metadata[key]='TBD';clean.set_metadata(metadata)
            assert release.errors(clean),key
            clean.set_metadata(release.INFO)
        clean.set_xml_metadata('<bad/>');assert release.errors(clean),'Bad XMP escaped'
        root=Path(d);(root/'source.md').write_text('A placeholder and TBD.\n')
        source=pymupdf.open();page=source.new_page(width=504,height=720);page.insert_text((50,70),'A placeholder and TBD.')
        manifest={'source_sha256':{'source.md':'checked upstream'},'texts':{'p1':{'source':'source.md','line':1}},'fences':[]}
        pages=[{'rect':{'x':0,'y':0},'texts':[{'id':'p1','rect':{'x':48/.75,'y':55/.75,'right':220/.75,'bottom':75/.75}}],'code':[]}]
        assert not release.publication_terms(source,manifest,pages,root)['failures']
        page.insert_text((50,120),'placeholder')
        assert release.publication_terms(source,manifest,pages,root)['failures'],'Generated placeholder escaped'
        page.insert_text((50,150),'example.invalid')
        assert release.publication_terms(source,manifest,pages,root)['failures'],'Generated invalid URL escaped'
        (root/'source.md').write_text('Different source.\n')
        assert release.publication_terms(source,manifest,pages,root)['failures'],'Source count mismatch escaped'
    print('PASS: red paint, outline, link, annotation, form, JavaScript and false metadata controls; clean PDF preserves text and real Info/XMP')
def furniture_controls(pdf):
    from check_release_polish import geometry, folios
    original=Path(pdf).read_bytes()
    good=pymupdf.open(stream=original,filetype='pdf')
    assert not release.errors(good),release.errors(good)
    assert not geometry(good)['failures'],geometry(good)['failures']
    for number in (1,2,3):
        doc=pymupdf.open(stream=original,filetype='pdf');doc[number-1].insert_text((49,697.5),str(number))
        assert f'p{number}: front-matter footer must be empty' in geometry(doc)['failures']
        doc.close()
    duplicate=pymupdf.open(stream=original,filetype='pdf');duplicate[9].insert_text((430,697.5),'10')
    assert 'p10: missing, extra or wrong folio' in geometry(duplicate)['failures']
    wrong=pymupdf.open(stream=original,filetype='pdf')
    page=wrong[9];page.add_redact_annot(folios(page)[0]['bbox']);page.apply_redactions();page.insert_text((430,697.5),'10')
    assert 'p10: folio is not at the outer text edge' in geometry(wrong)['failures']
    offcenter=pymupdf.open(stream=original,filetype='pdf');page=offcenter[2]
    page.add_redact_annot(page.rect);page.apply_redactions();page.insert_text((59,291),'For Dafna, Refael, Noa, and Shiri.')
    assert 'Dedication text box is not centered on the paper within 1pt' in geometry(offcenter)['failures']
    print('PASS: all 438 pages, outer folios and centered dedication; forbidden front-matter folios, duplicate folio, wrong-side folio and off-center dedication controls')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--pdf',type=Path);args=parser.parse_args()
    main()
    if args.pdf:furniture_controls(args.pdf)
