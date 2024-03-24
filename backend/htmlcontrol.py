from bs4 import BeautifulSoup, NavigableString

def htmlcontrol(html_path):
    with open(html_path, 'r', encoding='UTF-8') as file:
        htmlString = file.read()

    # Parsing the HTML string
    soup = BeautifulSoup(htmlString, 'html.parser')

    # Finding and removing the <style> tag from <head>
    style_tag = soup.head.find('style')
    if style_tag:
        style_tag.decompose()

    # Finding and removing all content before the first h2 heading tag
    preview_content_div = soup.find('div', id='preview-content')

    if preview_content_div:
        # Finding the first <h2> tag within the target div
        first_h2 = preview_content_div.find('h2')
        
        if first_h2:
            # Finding all elements before the first <h2> tag
            for element in list(preview_content_div.children):
                if element == first_h2:
                    break  # Stop when the first <h2> is reached
                if isinstance(element, NavigableString):
                    continue  # Skip navigable strings (like whitespace)
                element.decompose()  # Remove the element

    # Make the section tag
    h2_tags = soup.find_all('h2')
    sections = []

    for h2_tag in h2_tags:
        # Create section tag
        section = soup.new_tag('section')
        
        # Move the <h2> and subsequent elements to the next <h2> into the section
        current_element = h2_tag
        while current_element:
            next_element = current_element.next_sibling
            # if next_element:
            #     # Skip empty NavigableString elements (like whitespace)
            #     current_element = next_element
            #     continue
            if next_element and next_element.name == 'h2':
                # Stop if the next <h2> tag is reached
                break
            # Move the current element into the section
            section.append(current_element.extract())
            current_element = next_element
        
        sections.append(section)

    # Insert sections back into the document
    for section in sections:
        preview_content_div.append(section)

    # Add style to new html doc
    link_tag = soup.new_tag("link", href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap", rel="stylesheet")
    soup.head.append(link_tag)
    style_tag = soup.new_tag('style')
    style_tag.string="""
        body {
                padding: 0;
                margin: 0;
                color: #606c71;
                font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
            }

            #container-ruller {
                width: 100vw;
                height: 48px;
                background-image: linear-gradient(120deg, rgb(21, 87, 153), rgb(21, 153, 87));
            }

            #preview-content {
                margin: 0 auto;
                padding: 2rem 4rem;
                max-width: 70rem;
            }

            h2 {
                color: rgb(21, 153, 87);
                font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
                font-size: 1.5rem;
                font-weight: 400;
                margin: 0 0 16px 0
            }

            section div,
            li {
                margin: 17.6px 0;
                color: rgb(96, 108, 113);
                font-size: 1.1rem;
                line-height: 26.4px;
                text-align: justify;
                font-weight: 200;
                font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
            }

            .math-block {
                display: flex;
                justify-content: center;
            }

            img {
                width: 50vw;
                height: auto;
            }

            table {
                display: table;
                border-color: gray;
                border-collapse: collapse;
                border-spacing: 0;
                word-break: keep-all;
                font-size: 0.8em;
            }

            tr {
                display: table-row;
            }

            th {
                display: table-cell;
                font-weight: 700;
                background-color: #159957;
                color: white;
                padding: 0.5rem 1rem;
                border-bottom: 1px solid #e9ebec;
                text-align: left;
            }

            td {
                padding: .5rem 1rem;
                border-bottom: 1px solid #e9ebec;
                text-align: left;
            }

            tbody {
                display: table-row-group;
                vertical-align: middle;
                unicode-bidi: isolate;
                border-color: inherit;
            }
            table tr:nth-child(odd) {
                background-color: #f2f2f2;
            }
            a {
                color: #1e6bb8;
                text-decoration: none;
            }
    """
    soup.head.append(style_tag)

    # Keywords to check in the content of <h2> tags
    keywords = ["RESUMEN", "Introducción", "Metodología", "Resultados", "Conclusiones", "Agradecimientos", "Referencias", "CONCLUSIONES Y DISCUSIÓN", "ANEXOS", "BIBLIOGRAFÍA", "REFERENCIAS BIBLIOGRÁFICAS"]

    # Find all <h2> tags
    h2_tags = soup.find_all('h2')

    for h2 in h2_tags:
        # Check if the content of the <h2> tag matches any of the keywords
        if any(keyword.lower() in h2.text.lower() for keyword in keywords):
            continue
        else:
            # Create a new <h3> tag with the same content and attributes as the <h2> tag
            h3 = soup.new_tag('h3')
            h3.attrs = h2.attrs
            h3.string = h2.string
            
            # Replace the <h2> tag with the new <h3> tag
            h2.replace_with(h3)

    # Add style for figure and food content
    div_tags = preview_content_div.find_all('div')

    for div in div_tags:
        # Check if the content of the <div> tag includes both "Figure" and ":"
        if "figura" in div.text.lower() and ":" in div.text or "gráfico" in div.text.lower() and ":" in div.textor or "cuadro" in div.text.lower() and ":" in div.text:
            # Add an inline style attribute to the <div> tag
            div['style'] = 'text-align: center'
        if "fuente:" in div.text.lower() or "euente:" in div.text.lower() or "nota." in div.text.lower():
            div['style'] = 'font-size: 0.9rem; text-align: center'

    # Serializing back to HTML string
    modifiedHtmlString = str(soup)

    with open(html_path.replace('.html', '.convert.html'), 'w', encoding='UTF-8') as file:
        file.write(modifiedHtmlString)
